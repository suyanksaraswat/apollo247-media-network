import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

describe("POST /api/review", () => {
  it("rejects an unknown product type", async () => {
    const response = await post({ lines: ["Hi"], category: "fmcg_food", productClass: "magic" });
    expect(response.status).toBe(400);
  });

  it("rejects too many lines", async () => {
    const response = await post({
      lines: ["a", "b", "c", "d", "e", "f"],
      category: "fmcg_food",
      productClass: "fmcg",
    });
    expect(response.status).toBe(400);
  });

  it("refuses prescription medicines by rule", async () => {
    const response = await post({
      lines: ["Kills germs fast."],
      category: "otc",
      productClass: "rx",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ source: "rules", value: { verdict: "refuse" } });
  });

  it("says the AI is off for new copy when no key is set", async () => {
    const response = await post({
      lines: ["New flavour, same crunch."],
      category: "fmcg_food",
      productClass: "fmcg",
    });
    expect(response.status).toBe(503);
  });
});
