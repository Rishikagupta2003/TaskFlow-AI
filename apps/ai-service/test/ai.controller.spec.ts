import { describe, it, expect } from 'vitest';
import { AiController } from '../src/ai/ai.controller.js';
import { AiService } from '../src/ai/ai.service.js';
import { MockAiProvider } from '../src/providers/mock.provider.js';
import { GeminiProvider } from '../src/providers/gemini.provider.js';

describe('AiController (ai-service)', () => {
  const geminiProvider = new GeminiProvider();
  const mockProvider = new MockAiProvider();
  const aiService = new AiService(geminiProvider, mockProvider);
  const controller = new AiController(aiService);

  it('should return health check with active provider name', () => {
    const health = controller.healthCheck();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('ai-service');
    expect(health.activeProvider).toBeDefined();
    expect(health.timestamp).toBeDefined();
  });

  it('should return wrapped data for generateTaskDrafts', async () => {
    const response = await controller.generateTaskDrafts({
      projectObjective: 'Migrate PostgreSQL schemas to Supabase',
      maxDrafts: 3,
    });

    expect(response.data).toBeDefined();
    expect(response.data.drafts.length).toBe(3);
    expect(response.data.disclaimer).toBeDefined();
  });

  it('should return wrapped data for summarizeProject', async () => {
    const response = await controller.summarizeProject({
      projectName: 'Sprint 43',
      completedCount: 12,
      pendingCount: 4,
      milestoneNotes: 'Frontend integration pending review',
    });

    expect(response.data).toBeDefined();
    expect(response.data.summary.healthStatus).toBe('ON_TRACK');
  });
});
