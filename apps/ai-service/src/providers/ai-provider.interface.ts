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

export type ProjectHealthStatus = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';

export interface ProjectSummaryOutput {
  headline: string;
  healthStatus: ProjectHealthStatus;
  keyAchievements: string[];
  milestoneRisks: string[];
}

export interface GenerateDraftsParams {
  projectObjective: string;
  projectId?: string;
  maxDrafts?: number;
}

export interface SummarizeProjectParams {
  projectName: string;
  completedCount: number;
  pendingCount: number;
  milestoneNotes?: string;
}

export interface AiProvider {
  readonly providerName: string;
  generateTaskDrafts(params: GenerateDraftsParams): Promise<AiTaskDraft[]>;
  summarizeProject(params: SummarizeProjectParams): Promise<ProjectSummaryOutput>;
}
