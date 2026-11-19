import { Type } from "typebox";

/** Allowlisted information from a failed assistant record, not a recovery instruction. */
export type WorkflowProviderError = {
  readonly provider?: string;
  readonly model?: string;
  /** Provider response or generation id. */
  readonly responseId?: string;
  readonly stopReason: "error";
  /** Pi's AssistantMessage exposes no structured retry disposition. */
  readonly disposition: "unknown";
};

export const WORKFLOW_ERROR_OUTPUT = Type.Object({
  code: Type.String(),
  message: Type.String(),
  provider: Type.Optional(Type.Object({
    provider: Type.Optional(Type.String()),
    model: Type.Optional(Type.String()),
    responseId: Type.Optional(Type.String({ description: "Provider response or generation id" })),
    stopReason: Type.Literal("error"),
    disposition: Type.Literal("unknown"),
  }, { additionalProperties: false })),
});

// Self-contained: the sandbox worker also uses this projection for errors on its JSON wire.
export function decodeProviderError(value: unknown): WorkflowProviderError | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const { provider, model, responseId, stopReason, disposition } = value as Record<string, unknown>;
  if (stopReason !== "error" || disposition !== "unknown" ||
      provider !== undefined && typeof provider !== "string" ||
      model !== undefined && typeof model !== "string" ||
      responseId !== undefined && typeof responseId !== "string") return undefined;
  return {
    ...(provider === undefined ? {} : { provider }),
    ...(model === undefined ? {} : { model }),
    ...(responseId === undefined ? {} : { responseId }),
    stopReason,
    disposition,
  };
}
