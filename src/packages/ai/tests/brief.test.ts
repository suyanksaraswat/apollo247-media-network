import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import { parseBrief } from "../brief";

const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  ThinkingLevel: { LOW: "LOW" },
}));

const answer = (value: unknown) => ({ text: JSON.stringify(value) });

const valid = {
  category: "nutrition",
  productClass: "fmcg",
  objective: "trial",
  cities: ["pune", "pune", "atlantis"],
  budgetINR: 1_200_000.4,
  weeks: 5,
  creativeLines: ["  Protein that tastes like dessert.  ", ""],
  conditionTargeting: { asked: false, note: "ignored when not asked" },
  summary: "A protein bar wants trial in Pune.",
};

describe("parseBrief", () => {
  const original = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = original;
  });

  it("answers a sample brief from its stored fields without calling the model", async () => {
    const sample = SAMPLE_BRIEFS[0];
    if (!sample) throw new Error("no sample briefs");
    const outcome = await parseBrief(`  ${sample.text} `);
    expect(outcome).toEqual({ kind: "ok", value: sample.fields, source: "sample" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("reports the AI as off when no key is set", async () => {
    process.env.GEMINI_API_KEY = "";
    const outcome = await parseBrief("A new protein bar in Pune for five weeks.");
    expect(outcome).toMatchObject({ kind: "unavailable", reason: "no_key" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("keeps only valid values from the model's answer", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValue(answer(valid));
    const outcome = await parseBrief("A new protein bar in Pune for five weeks.");
    expect(outcome).toEqual({
      kind: "ok",
      source: "gemini",
      value: {
        category: "nutrition",
        productClass: "fmcg",
        objective: "trial",
        cities: ["pune"],
        budgetINR: 1_200_000,
        weeks: 5,
        creativeLines: ["Protein that tastes like dessert."],
        conditionTargeting: { asked: false, note: null },
        summary: "A protein bar wants trial in Pune.",
      },
    });
  });

  it("drops a budget or length the model could not read", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValue(answer({ ...valid, budgetINR: -5, weeks: 2.5 }));
    const outcome = await parseBrief("Protein bar, Pune.");
    expect(outcome).toMatchObject({ kind: "ok", value: { budgetINR: null, weeks: null } });
  });

  it("rejects an answer outside the allowed categories", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValue(answer({ ...valid, category: "crypto" }));
    const outcome = await parseBrief("Protein bar, Pune.");
    expect(outcome).toMatchObject({ kind: "unavailable", reason: "bad_output" });
  });

  it("rejects text that is not JSON", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValue({ text: "Sure! Here is the plan." });
    const outcome = await parseBrief("Protein bar, Pune.");
    expect(outcome).toMatchObject({ kind: "unavailable", reason: "bad_output" });
  });

  it("reports a model failure without throwing once every model has failed", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockGenerateContent.mockRejectedValue(new Error("quota exceeded"));
    const outcome = await parseBrief("Protein bar, Pune.");
    expect(outcome).toMatchObject({ kind: "unavailable", reason: "model_error" });
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it("falls back to the second model when the first is busy", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockGenerateContent
      .mockRejectedValueOnce(new Error("503 high demand"))
      .mockResolvedValueOnce(answer(valid));
    const outcome = await parseBrief("Protein bar, Pune.");
    expect(outcome).toMatchObject({ kind: "ok", source: "gemini" });
    expect(mockGenerateContent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ model: "gemini-3.8-flash" }),
    );
    expect(mockGenerateContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ model: "gemini-3.5-flash" }),
    );
  });

  it("asks for structured output in the allowed shape", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValue(answer(valid));
    await parseBrief("Protein bar, Pune.");
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          responseMimeType: "application/json",
          responseJsonSchema: expect.objectContaining({
            required: expect.arrayContaining(["productClass", "cities"]),
          }),
        }),
      }),
    );
  });
});
