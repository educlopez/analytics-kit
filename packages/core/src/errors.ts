export type AnalyticsErrorCode =
  "UNSUPPORTED" | "AUTH" | "RATE_LIMIT" | "NETWORK" | "INVALID_QUERY" | "PROVIDER";

export class AnalyticsError extends Error {
  readonly code: AnalyticsErrorCode;
  readonly connectorId?: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(
    code: AnalyticsErrorCode,
    message: string,
    options?: { connectorId?: string; status?: number; details?: unknown; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "AnalyticsError";
    this.code = code;
    this.connectorId = options?.connectorId;
    this.status = options?.status;
    this.details = options?.details;
  }
}

export function isAnalyticsError(error: unknown): error is AnalyticsError {
  return error instanceof AnalyticsError;
}
