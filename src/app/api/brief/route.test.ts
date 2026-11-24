import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

describe("POST /api/brief", () => {
  it("rejects an empty brief", async () => {
    const response = await post({ text: "   " });
    expect(response.status).toBe(400);
  });

  it("rejects a body that is not JSON", async () => {
    const response = await post("not json");
    expect(response.status).toBe(400);
  });

  it("rejects a brief that is too long", async () => {
    const response = await post({ text: "x".repeat(2001) });
    expect(response.status).toBe(400);
  });

  it("answers a sample brief from stored fields", async () => {
    const sample = SAMPLE_BRIEFS[1];
    if (!sample) throw new Error("no sample briefs");
    const response = await post({ text: sample.text });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ kind: "ok", value: sample.fields, source: "sample" });
  });

  it("says the AI is off for other briefs when no key is set", async () => {
    const response = await post({ text: "A protein bar in Pune for five weeks." });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ kind: "unavailable", reason: "no_key" });
  });
});
