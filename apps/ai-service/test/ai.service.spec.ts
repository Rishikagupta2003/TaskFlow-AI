import { describe, it, expect, vi } from 'vitest';
import { AiService, AI_ADVISORY_DISCLAIMER } from '../src/ai/ai.service.js';
import { MockAiProvider } from '../src/providers/mock.provider.js';
import { GeminiProvider } from '../src/providers/gemini.provider.js';

describe('AiService', () => {
  it('should use MockAiProvider when GeminiProvider is unavailable', () => {
    const mockGemini = { isAvailable: vi.fn().mockReturnValue(false) } as unknown as GeminiProvider;
    const mockProvider = new MockAiProvider();
    const service = new AiService(mockGemini, mockProvider);

    expect(service.getActiveProvider()).toBe(mockProvider);
  });

  it('should use GeminiProvider when GeminiProvider is available', () => {
    const mockGemini = { isAvailable: vi.fn().mockReturnValue(true) } as unknown as GeminiProvider;
    const mockProvider = new MockAiProvider();
    const service = new AiService(mockGemini, mockProvider);

    expect(service.getActiveProvider()).toBe(mockGemini);
  });

  it('should attach mandatory advisory disclaimer to generated drafts', async () => {
    const mockGemini = { isAvailable: vi.fn().mockReturnValue(false) } as unknown as GeminiProvider;
    const mockProvider = new MockAiProvider();
    const service = new AiService(mockGemini, mockProvider);

    const result = await service.generateTaskDrafts({ projectObjective: 'Build RBAC matrix' });

    expect(result.disclaimer).toBe(AI_ADVISORY_DISCLAIMER);
    expect(result.provider).toBe(mockProvider.providerName);
    expect(result.drafts.length).toBeGreaterThan(0);
  });

  it('should attach mandatory advisory disclaimer to project summary', async () => {
    const mockGemini = { isAvailable: vi.fn().mockReturnValue(false) } as unknown as GeminiProvider;
    const mockProvider = new MockAiProvider();
    const service = new AiService(mockGemini, mockProvider);

    const result = await service.summarizeProject({
      projectName: 'Security Audit',
      completedCount: 5,
      pendingCount: 1,
    });

    expect(result.disclaimer).toBe(AI_ADVISORY_DISCLAIMER);
    expect(result.provider).toBe(mockProvider.providerName);
    expect(result.summary.headline).toContain('Security Audit');
  });
});
