import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import type { BriefFields, SampleBrief } from "@/packages/catalog/types";
import { AiUnavailableError, generateJson } from "./lib/gemini";
import { BRIEF_SYSTEM } from "./lib/prompts";
import { BRIEF_SCHEMA } from "./lib/schemas";
import { toBriefFields } from "./lib/validate";
import type { AiOutcome } from "./outcome";

export const MAX_BRIEF_CHARS = 2000;

export function sampleBriefFor(text: string): SampleBrief | undefined {
  const trimmed = text.trim();
  return SAMPLE_BRIEFS.find((brief) => brief.text === trimmed);
}

export async function parseBrief(text: string): Promise<AiOutcome<BriefFields>> {
  const sample = sampleBriefFor(text);
  if (sample) return { kind: "ok", value: sample.fields, source: "sample" };
  try {
    const raw = await generateJson({
      system: BRIEF_SYSTEM,
      prompt: text.trim().slice(0, MAX_BRIEF_CHARS),
      schema: BRIEF_SCHEMA,
    });
    return { kind: "ok", value: toBriefFields(raw), source: "gemini" };
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return { kind: "unavailable", reason: error.reason, message: error.message };
    }
    throw error;
  }
}
