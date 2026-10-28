// Shared contracts, DTO interfaces, and API response envelopes
export interface ApiResponseMeta {
  requestId?: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}
