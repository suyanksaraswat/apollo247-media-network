export type UnavailableReason = "no_key" | "model_error" | "bad_output" | "rate_limited";

export type AiOutcome<T> =
  | { kind: "ok"; value: T; source: "gemini" | "sample" | "rules" }
  | { kind: "unavailable"; reason: UnavailableReason; message: string };

export const UNAVAILABLE_MESSAGES: Record<UnavailableReason, string> = {
  no_key:
    "AI reading is switched off on this deployment. Pick a sample brief or fill in the fields yourself.",
  model_error:
    "The AI service did not answer. Try again in a minute, or fill in the fields yourself.",
  bad_output: "The AI answer could not be used. Try rephrasing, or fill in the fields yourself.",
  rate_limited: "Too many AI requests from this connection. Wait a few minutes and try again.",
};
