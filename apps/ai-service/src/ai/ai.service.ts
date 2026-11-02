import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini.provider.js';
import { MockAiProvider } from '../providers/mock.provider.js';
import type {
  AiProvider,
  GenerateDraftsParams,
  SummarizeProjectParams,
  AiTaskDraft,
  ProjectSummaryOutput,
} from '../providers/ai-provider.interface.js';

export const AI_ADVISORY_DISCLAIMER =
  'AI-generated task proposals are strictly advisory. Explicit user review and approval are required before any task is persisted.';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly mockProvider: MockAiProvider,
  ) {}

  getActiveProvider(): AiProvider {
    if (this.geminiProvider.isAvailable()) {
      return this.geminiProvider;
    }
    return this.mockProvider;
  }

  async generateTaskDrafts(params: GenerateDraftsParams): Promise<{
    drafts: AiTaskDraft[];
    provider: string;
    disclaimer: string;
  }> {
    const provider = this.getActiveProvider();
    this.logger.log(`Executing task drafting using provider: ${provider.providerName}`);

    const drafts = await provider.generateTaskDrafts(params);

    return {
      drafts,
      provider: provider.providerName,
      disclaimer: AI_ADVISORY_DISCLAIMER,
    };
  }

  async summarizeProject(params: SummarizeProjectParams): Promise<{
    summary: ProjectSummaryOutput;
    provider: string;
    disclaimer: string;
  }> {
    const provider = this.getActiveProvider();
    this.logger.log(`Executing project summary using provider: ${provider.providerName}`);

    const summary = await provider.summarizeProject(params);

    return {
      summary,
      provider: provider.providerName,
      disclaimer: AI_ADVISORY_DISCLAIMER,
    };
  }
}
