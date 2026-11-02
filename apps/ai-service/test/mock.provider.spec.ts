import { describe, it, expect } from 'vitest';
import { MockAiProvider } from '../src/providers/mock.provider.js';

describe('MockAiProvider', () => {
  const provider = new MockAiProvider();

  it('should generate bounded task drafts matching requested limit', async () => {
    const drafts = await provider.generateTaskDrafts({
      projectObjective: 'Build Next.js real-time collaborative editor',
      maxDrafts: 2,
    });

    expect(drafts).toHaveLength(2);
    expect(drafts[0].id).toBeDefined();
    expect(drafts[0].title).toContain('Build Next.js real-time collaborative');
    expect(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).toContain(drafts[0].priority);
    expect(Array.isArray(drafts[0].subtasks)).toBe(true);
    expect(drafts[0].subtasks.length).toBeGreaterThan(0);
    expect(drafts[0].estimatedHours).toBeDefined();
    expect(drafts[0].rationale).toBeDefined();
  });

  it('should generate project summary with health status and achievements', async () => {
    const summary = await provider.summarizeProject({
      projectName: 'TaskFlow AI Mobile',
      completedCount: 8,
      pendingCount: 2,
      milestoneNotes: 'Release candidate ready for store submission',
    });

    expect(summary.headline).toContain('TaskFlow AI Mobile');
    expect(summary.healthStatus).toBe('ON_TRACK');
    expect(summary.keyAchievements.length).toBeGreaterThan(0);
    expect(summary.milestoneRisks).toContain('Release candidate ready for store submission');
  });

  it('should flag healthStatus as AT_RISK or CRITICAL when pending tasks are high', async () => {
    const summary = await provider.summarizeProject({
      projectName: 'Overdue Project',
      completedCount: 2,
      pendingCount: 30,
    });

    expect(summary.healthStatus).toBe('CRITICAL');
  });
});
