/**
 * Enum of application error codes.
 * Extend this enum when adding new domain/application error types.
 */
export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  CONFLICT = "CONFLICT",
  EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_GATEWAY = "BAD_GATEWAY",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT",
}

/**
 * Map connecting each ErrorCode to its default HTTP status code.
 */
export const ERROR_CODE_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.EMAIL_ALREADY_REGISTERED]: 409,
  [ErrorCode.UNPROCESSABLE_ENTITY]: 422,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.BAD_GATEWAY]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.GATEWAY_TIMEOUT]: 504,
};

/**
 * Standard detail payload for API errors.
 */
export interface ApiErrorDetail {
  statusCode: number;
  errorCode: ErrorCode | string;
  message?: string;
  details?: unknown;
  path: string;
}

/**
 * Generic standard API response structure used across frontend and backend.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiErrorDetail | null;
}
