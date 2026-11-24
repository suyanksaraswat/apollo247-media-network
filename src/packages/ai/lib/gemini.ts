import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { UNAVAILABLE_MESSAGES, type UnavailableReason } from "../outcome";

export class AiUnavailableError extends Error {
  readonly reason: UnavailableReason;

  constructor(reason: UnavailableReason) {
    super(UNAVAILABLE_MESSAGES[reason]);
    this.name = "AiUnavailableError";
    this.reason = reason;
  }
}

const DEFAULT_MODEL = "gemini-3.8-flash";
const DEFAULT_FALLBACK_MODELS = "gemini-3.5-flash,gemini-3.5-flash-lite";
const ATTEMPT_TIMEOUT_MS = 18_000;

let cached: { key: string; client: GoogleGenAI } | null = null;

function client(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new AiUnavailableError("no_key");
  if (cached?.key !== key) {
    cached = {
      key,
      client: new GoogleGenAI({ apiKey: key, httpOptions: { timeout: ATTEMPT_TIMEOUT_MS } }),
    };
  }
  return cached.client;
}

export function modelNames(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS?.trim() || DEFAULT_FALLBACK_MODELS)
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
  return [...new Set([primary, ...fallbacks])];
}

type Request = { system: string; prompt: string; schema: object };

async function attempt(
  ai: GoogleGenAI,
  models: readonly string[],
  request: Request,
): Promise<string | undefined> {
  const [model, ...rest] = models;
  if (!model) throw new AiUnavailableError("model_error");
  try {
    const response = await ai.models.generateContent({
      model,
      contents: request.prompt,
      config: {
        systemInstruction: request.system,
        responseMimeType: "application/json",
        responseJsonSchema: request.schema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    return response.text;
  } catch (error) {
    console.error("gemini_call_failed", { model, error: String(error) });
    return attempt(ai, rest, request);
  }
}

export async function generateJson(request: Request): Promise<unknown> {
  const text = await attempt(client(), modelNames(), request);
  if (!text) throw new AiUnavailableError("bad_output");
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch {
    throw new AiUnavailableError("bad_output");
  }
}
