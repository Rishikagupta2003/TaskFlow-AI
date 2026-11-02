import { Injectable, Logger } from '@nestjs/common';
import type {
  AiProvider,
  GenerateDraftsParams,
  SummarizeProjectParams,
  AiTaskDraft,
  ProjectSummaryOutput,
} from './ai-provider.interface.js';

@Injectable()
export class MockAiProvider implements AiProvider {
  readonly providerName = 'MockAiProvider (Offline Fallback)';
  private readonly logger = new Logger(MockAiProvider.name);

  async generateTaskDrafts(params: GenerateDraftsParams): Promise<AiTaskDraft[]> {
    this.logger.log(`Generating task drafts via MockAiProvider for objective: [redacted for privacy, length: ${params.projectObjective.length}]`);

    const limit = Math.min(Math.max(params.maxDrafts ?? 3, 1), 6);
    const objective = params.projectObjective.trim();

    const drafts: AiTaskDraft[] = [
      {
        id: `draft-${Date.now()}-1`,
        title: `Design architecture specification for ${objective.slice(0, 40)}`,
        description: `Define system boundaries, data flow diagrams, and interface contracts for: ${objective}`,
        priority: 'HIGH',
        estimatedHours: '4 hours',
        rationale: 'Foundational architecture review ensures clean service boundaries before code implementation.',
        subtasks: [
          'Document high-level components and data flows',
          'Specify API contracts and input validation rules',
          'Review security constraints and error handling',
        ],
      },
      {
        id: `draft-${Date.now()}-2`,
        title: `Implement core functionality and unit tests for ${objective.slice(0, 35)}`,
        description: `Build domain services and unit test suites covering both success and edge cases.`,
        priority: 'MEDIUM',
        estimatedHours: '6 hours',
        rationale: 'Core implementation delivers immediate value while preserving 100% test coverage.',
        subtasks: [
          'Scaffold service layer with validation guards',
          'Implement business logic and data mapping',
          'Add Vitest unit tests for positive and negative paths',
        ],
      },
      {
        id: `draft-${Date.now()}-3`,
        title: `Verify end-to-end integration and security audit`,
        description: `Run lint, test, and production builds across affected monorepo workspaces.`,
        priority: 'LOW',
        estimatedHours: '3 hours',
        rationale: 'Verification ensures zero regressions before promotion to production environment.',
        subtasks: [
          'Execute linter across all workspaces',
          'Validate production bundle compilation',
          'Confirm no sensitive credentials are logged or exposed',
        ],
      },
    ];

    return drafts.slice(0, limit);
  }

  async summarizeProject(params: SummarizeProjectParams): Promise<ProjectSummaryOutput> {
    const total = params.completedCount + params.pendingCount;
    const completionRate = total > 0 ? Math.round((params.completedCount / total) * 100) : 0;

    let healthStatus: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' = 'ON_TRACK';
    if (params.pendingCount > 25) {
      healthStatus = 'CRITICAL';
    } else if (completionRate < 30 && params.pendingCount > 10) {
      healthStatus = 'AT_RISK';
    }

    return {
      headline: `${params.projectName}: ${completionRate}% Complete (${params.completedCount}/${total} tasks finished)`,
      healthStatus,
      keyAchievements: [
        `Successfully delivered ${params.completedCount} project deliverables`,
        'Service boundary contracts and authorization verification established',
        'Automated CI/CD validation suites operational',
      ],
      milestoneRisks: params.milestoneNotes
        ? [params.milestoneNotes, 'Workload balancing across active team members']
        : [
            `${params.pendingCount} pending task items require prioritization`,
            'Downstream third-party rate limits require monitoring',
          ],
    };
  }
}
