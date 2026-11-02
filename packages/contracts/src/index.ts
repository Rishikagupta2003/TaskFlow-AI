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

// AI Task Drafting & Summarization Contracts
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface AiTaskDraft {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  subtasks: string[];
  estimatedHours: string;
  rationale: string;
}

export interface GenerateTaskDraftsRequestDto {
  projectObjective: string;
  projectId?: string;
  maxDrafts?: number;
}

export interface GenerateTaskDraftsResponseData {
  drafts: AiTaskDraft[];
  provider: string;
  disclaimer: string;
}

export type ProjectHealthStatus = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';

export interface ProjectSummaryOutput {
  headline: string;
  healthStatus: ProjectHealthStatus;
  keyAchievements: string[];
  milestoneRisks: string[];
}

export interface SummarizeProjectRequestDto {
  projectName: string;
  completedCount: number;
  pendingCount: number;
  milestoneNotes?: string;
}

export interface SummarizeProjectResponseData {
  summary: ProjectSummaryOutput;
  provider: string;
  disclaimer: string;
}


