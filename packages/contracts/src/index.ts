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

export interface UserProfileDto {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferences?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
}

