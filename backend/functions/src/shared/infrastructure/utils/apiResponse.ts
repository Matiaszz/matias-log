import { Response } from "express";
import {
  ApiResponse,
  ErrorCode,
  ERROR_CODE_STATUS_MAP,
  ApiErrorDetail,
} from "../types/api.types";

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function createErrorResponse(
  errorCode: ErrorCode | string,
  path: string,
  options?: {
    message?: string;
    details?: unknown;
    statusCode?: number;
  }
): ApiResponse<null> {
  const defaultStatusCode =
    typeof errorCode === "string" && errorCode in ERROR_CODE_STATUS_MAP ?
      ERROR_CODE_STATUS_MAP[errorCode as ErrorCode] :
      500;

  const statusCode = options?.statusCode ?? defaultStatusCode;

  const errorDetail: ApiErrorDetail = {
    statusCode,
    errorCode,
    path,
    ...(options?.message && { message: options.message }),
    ...(options?.details !== undefined && { details: options.details }),
  };

  return {
    success: false,
    data: null,
    error: errorDetail,
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200
): Response {
  return res.status(statusCode).json(createSuccessResponse(data));
}

export function sendError(
  res: Response,
  errorCode: ErrorCode | string,
  path: string,
  options?: {
    message?: string;
    details?: unknown;
    statusCode?: number;
  }
): Response {
  const responsePayload = createErrorResponse(errorCode, path, options);
  const status = responsePayload.error ?
    responsePayload.error.statusCode :
    500;

  return res.status(status).json(responsePayload);
}
