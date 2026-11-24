import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import { reviewCreative } from "../review";

const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  ThinkingLevel: { LOW: "LOW" },
}));

describe("reviewCreative", () => {
  const original = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    mockGenerateContent.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = original;
  });

  it("refuses a prescription medicine by rule, without the model", async () => {
    const outcome = await reviewCreative({
      lines: ["Fast relief from infections."],
      category: "otc",
      productClass: "rx",
    });
    expect(outcome).toMatchObject({
      kind: "ok",
      source: "rules",
      value: { verdict: "refuse", issues: [{ rule: "rx_promotion" }] },
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("passes empty copy without the model", async () => {
    const outcome = await reviewCreative({
      lines: ["  "],
      category: "fmcg_food",
      productClass: "fmcg",
    });
    expect(outcome).toEqual({ kind: "ok", source: "rules", value: { verdict: "ok", issues: [] } });
  });

  it("answers a sample's copy from its stored review", async () => {
    const sample = SAMPLE_BRIEFS.find(
      (brief) => brief.review && brief.fields.creativeLines.length > 0,
    );
    if (!sample?.review) throw new Error("no sample review");
    const outcome = await reviewCreative({
      lines: sample.fields.creativeLines,
      category: sample.fields.category,
      productClass: sample.fields.productClass,
    });
    expect(outcome).toEqual({ kind: "ok", source: "sample", value: sample.review });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("keeps only issues that quote the copy and name a known rule", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        verdict: "ok",
        issues: [
          {
            quote: "cures colds",
            rule: "cure_claim",
            problem: "A cure claim.",
            rewrite: "Soothes a sore throat.",
          },
          { quote: "not in the copy", rule: "other", problem: "Made up.", rewrite: "x" },
          { quote: "Honey", rule: "made_up_rule", problem: "Unknown rule.", rewrite: "x" },
        ],
      }),
    });
    const outcome = await reviewCreative({
      lines: ["Honey lozenges that cures colds."],
      category: "otc",
      productClass: "otc",
    });
    expect(outcome).toEqual({
      kind: "ok",
      source: "gemini",
      value: {
        verdict: "revise",
        issues: [
          {
            quote: "cures colds",
            rule: "cure_claim",
            problem: "A cure claim.",
            rewrite: "Soothes a sore throat.",
          },
        ],
      },
    });
  });

  it("reports the AI as off when no key is set", async () => {
    process.env.GEMINI_API_KEY = "";
    const outcome = await reviewCreative({
      lines: ["New flavour, same crunch."],
      category: "fmcg_food",
      productClass: "fmcg",
    });
    expect(outcome).toMatchObject({ kind: "unavailable", reason: "no_key" });
  });
});
