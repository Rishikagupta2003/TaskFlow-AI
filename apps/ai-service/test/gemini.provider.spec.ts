import { describe, it, expect, afterEach } from 'vitest';
import { GeminiProvider } from '../src/providers/gemini.provider.js';

describe('GeminiProvider', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  it('should report isAvailable as false when GEMINI_API_KEY is not set', () => {
    delete process.env.GEMINI_API_KEY;
    const provider = new GeminiProvider();
    expect(provider.isAvailable()).toBe(false);
  });

  it('should throw error when generating drafts without API key', async () => {
    delete process.env.GEMINI_API_KEY;
    const provider = new GeminiProvider();
    await expect(
      provider.generateTaskDrafts({ projectObjective: 'Test Objective' }),
    ).rejects.toThrow('GeminiProvider is not configured with an API key.');
  });

  it('should throw error when summarizing project without API key', async () => {
    delete process.env.GEMINI_API_KEY;
    const provider = new GeminiProvider();
    await expect(
      provider.summarizeProject({ projectName: 'Test', completedCount: 0, pendingCount: 0 }),
    ).rejects.toThrow('GeminiProvider is not configured with an API key.');
  });
});
