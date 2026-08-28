import { ApiResponse, ErrorCode, ERROR_CODE_STATUS_MAP } from "@/types/api.types";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "https://api-bpb3enu4rq-uc.a.run.app";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  /**
   * Set custom header dynamically (e.g. Auth tokens).
   */
  public setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Core request method that constructs URL, sends request using native fetch, and parses typed ApiResponse<T>.
   */
  public async request<T = unknown, B = unknown>(
    method: string,
    endpoint: string,
    body?: B,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, timeout = 30000, headers: customHeaders, ...fetchOpts } = options;

    const uppercaseMethod = method.toUpperCase();
    let url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
      ? endpoint
      : `${this.baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          queryParams.append(key, String(val));
        }
      });
    }

    let requestBody: BodyInit | undefined = undefined;

    if (body !== undefined && body !== null) {
      if (uppercaseMethod === "GET") {
        if (typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
          Object.entries(body as Record<string, unknown>).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              queryParams.append(key, String(val));
            }
          });
        }
      } else if (body instanceof FormData || typeof body === "string") {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    if (body instanceof FormData) {
      delete headers["Content-Type"];
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    let targetPath = endpoint;
    try {
      targetPath = new URL(url, "https://dummy.base").pathname;
    } catch {
      // Fallback
    }

    try {
      const response = await fetch(url, {
        method: uppercaseMethod,
        headers,
        body: requestBody,
        signal: fetchOpts.signal || controller.signal,
        ...fetchOpts,
      });

      clearTimeout(timer);

      let parsedData: unknown = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        parsedData = await response.json();
      } else {
        const text = await response.text();
        parsedData = text ? { message: text } : null;
      }

      // If backend already returns standard ApiResponse structure
      if (
        parsedData &&
        typeof parsedData === "object" &&
        "success" in parsedData &&
        typeof (parsedData as Record<string, unknown>).success === "boolean"
      ) {
        return parsedData as ApiResponse<T>;
      }

      // If backend returned raw success payload
      if (response.ok) {
        return {
          success: true,
          data: parsedData as T,
          error: null,
        };
      }

      const parsedObj = (parsedData && typeof parsedData === "object" ? parsedData : {}) as Record<string, unknown>;

      // Non-ok response wrapped into standard ApiResponse error structure
      return {
        success: false,
        data: null,
        error: {
          statusCode: response.status,
          errorCode: this.mapStatusToErrorCode(response.status),
          message: typeof parsedObj.message === "string" ? parsedObj.message : typeof parsedObj.error === "string" ? parsedObj.error : response.statusText,
          details: parsedData,
          path: targetPath,
        },
      };
    } catch (err: unknown) {
      clearTimeout(timer);

      const errorObj = err as Error;
      const isAbort = errorObj.name === "AbortError";
      const errorCode = isAbort ? ErrorCode.GATEWAY_TIMEOUT : ErrorCode.INTERNAL_ERROR;
      const statusCode = ERROR_CODE_STATUS_MAP[errorCode] || 500;

      return {
        success: false,
        data: null,
        error: {
          statusCode,
          errorCode,
          message: isAbort ? "Request timed out" : errorObj.message || "Network request failed",
          details: err,
          path: targetPath,
        },
      };
    }
  }

  public get<T = unknown, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>("GET", endpoint, body, options);
  }

  public post<T = unknown, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>("POST", endpoint, body, options);
  }

  public put<T = unknown, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>("PUT", endpoint, body, options);
  }

  public patch<T = unknown, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>("PATCH", endpoint, body, options);
  }

  public delete<T = unknown, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>("DELETE", endpoint, body, options);
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400: return ErrorCode.BAD_REQUEST;
      case 401: return ErrorCode.UNAUTHORIZED;
      case 403: return ErrorCode.FORBIDDEN;
      case 404: return ErrorCode.NOT_FOUND;
      case 405: return ErrorCode.METHOD_NOT_ALLOWED;
      case 409: return ErrorCode.CONFLICT;
      case 422: return ErrorCode.UNPROCESSABLE_ENTITY;
      case 429: return ErrorCode.TOO_MANY_REQUESTS;
      case 502: return ErrorCode.BAD_GATEWAY;
      case 503: return ErrorCode.SERVICE_UNAVAILABLE;
      case 504: return ErrorCode.GATEWAY_TIMEOUT;
      default: return ErrorCode.INTERNAL_ERROR;
    }
  }
}

export const Api = new ApiClient();
