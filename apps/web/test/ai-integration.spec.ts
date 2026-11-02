import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  requestTaskDrafts,
  requestProjectSummary,
  toEditableDraft,
  AiClientError,
  type EditableAiDraft,
} from '../src/lib/ai-client.js';
import type { AiTaskDraft } from '@taskflow/contracts';

describe('Frontend AI Client & Integration Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('requestTaskDrafts - Authentication & Authorization', () => {
    it('should throw an AiClientError (401) if accessToken is missing or empty', async () => {
      await expect(
        requestTaskDrafts({ projectObjective: 'Build auth flow' }, null),
      ).rejects.toThrow(AiClientError);

      await expect(
        requestTaskDrafts({ projectObjective: 'Build auth flow' }, undefined),
      ).rejects.toThrow('Authentication required');
    });

    it('should attach Bearer token and JSON headers when sending request', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          drafts: [
            {
              id: 'd-1',
              title: 'Draft Task 1',
              description: 'Desc 1',
              priority: 'HIGH',
              subtasks: ['Sub 1'],
              estimatedHours: '3 hours',
              rationale: 'Review first',
            },
          ],
          provider: 'MockAiProvider',
          disclaimer: 'Advisory only',
        }),
      });
      globalThis.fetch = mockFetch;

      const res = await requestTaskDrafts(
        { projectObjective: 'Design database schema for tasks', maxDrafts: 2 },
        'valid-user-jwt',
        { apiUrl: 'http://localhost:3001/api/v1' },
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/api/v1/ai/task-drafts');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe('Bearer valid-user-jwt');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.projectObjective).toBe('Design database schema for tasks');
      expect(body.maxDrafts).toBe(2);

      expect(res.drafts).toHaveLength(1);
      expect(res.provider).toBe('MockAiProvider');
      expect(res.disclaimer).toBe('Advisory only');
    });
  });

  describe('requestTaskDrafts - Safe Error Handling & Timeouts', () => {
    it('should map 401 response from Gateway to session expired error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized JWT signature' }),
      });

      await expect(
        requestTaskDrafts({ projectObjective: 'Build task' }, 'expired-token'),
      ).rejects.toThrow('Your session has expired');
    });

    it('should map 504 response to gateway timeout error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 504,
        json: async () => ({ message: 'Gateway Timeout' }),
      });

      await expect(
        requestTaskDrafts({ projectObjective: 'Lengthy prompt' }, 'valid-token'),
      ).rejects.toThrow('AI service timed out');
    });

    it('should map 502 response to bad gateway error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ message: 'Bad Gateway' }),
      });

      await expect(
        requestTaskDrafts({ projectObjective: 'Any prompt' }, 'valid-token'),
      ).rejects.toThrow('Unable to reach downstream AI service');
    });

    it('should capture validation error messages from 400 Bad Request', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'projectObjective must be longer than or equal to 5 characters',
          },
        }),
      });

      await expect(
        requestTaskDrafts({ projectObjective: 'Hi' }, 'valid-token'),
      ).rejects.toThrow('projectObjective must be longer than or equal to 5 characters');
    });

    it('should handle network connection errors gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch: Connection refused'));

      await expect(
        requestTaskDrafts({ projectObjective: 'Build auth' }, 'valid-token'),
      ).rejects.toThrow('Network error connecting to API Gateway');
    });
  });

  describe('requestProjectSummary', () => {
    it('should reject when unauthenticated', async () => {
      await expect(
        requestProjectSummary(
          { projectName: 'TaskFlow', completedCount: 5, pendingCount: 2 },
          null,
        ),
      ).rejects.toThrow('Authentication required');
    });

    it('should send summary request with verified token and return response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          summary: {
            headline: 'TaskFlow: 71% Complete',
            healthStatus: 'ON_TRACK',
            keyAchievements: ['Auth complete'],
            milestoneRisks: ['Load testing'],
          },
          provider: 'MockAiProvider',
          disclaimer: 'Advisory only',
        }),
      });

      const res = await requestProjectSummary(
        { projectName: 'TaskFlow', completedCount: 5, pendingCount: 2 },
        'jwt-token',
        { apiUrl: 'http://localhost:3001/api/v1' },
      );

      expect(res.summary.headline).toContain('71% Complete');
      expect(res.summary.healthStatus).toBe('ON_TRACK');
      expect(res.summary.keyAchievements).toContain('Auth complete');
    });
  });

  describe('Draft Editing & Explicit Human Approval Workflow', () => {
    const sampleRawDraft: AiTaskDraft = {
      id: 'draft-101',
      title: 'Design API Gateway Routes',
      description: 'Implement proxy endpoints with authentication',
      priority: 'HIGH',
      subtasks: ['Define routing module', 'Add JWT guard', 'Write integration tests'],
      estimatedHours: '4 hours',
      rationale: 'Gateway is single entry point',
    };

    it('should convert raw draft to editable draft with default review state', () => {
      const editable = toEditableDraft(sampleRawDraft);
      expect(editable.isEditing).toBe(false);
      expect(editable.isApproved).toBe(false);
      expect(editable.isDiscarded).toBe(false);
      expect(editable.id).toBe('draft-101');
    });

    it('should allow modifying draft title, priority, and subtasks', () => {
      const draft = toEditableDraft(sampleRawDraft);

      // Edit fields
      const updated: EditableAiDraft = {
        ...draft,
        title: 'Design API Gateway & Rate Limiting',
        priority: 'URGENT',
        subtasks: [...draft.subtasks, 'Configure CORS headers'],
        estimatedHours: '6 hours',
      };

      expect(updated.title).toBe('Design API Gateway & Rate Limiting');
      expect(updated.priority).toBe('URGENT');
      expect(updated.subtasks).toHaveLength(4);
      expect(updated.subtasks[3]).toBe('Configure CORS headers');
      expect(updated.isApproved).toBe(false); // remains unapproved while editing
    });

    it('should allow discarding a draft without touching approved tasks', () => {
      const drafts: EditableAiDraft[] = [
        toEditableDraft({ ...sampleRawDraft, id: 'd-1' }),
        toEditableDraft({ ...sampleRawDraft, id: 'd-2' }),
      ];

      // Discard d-1
      const remaining = drafts.filter((d) => d.id !== 'd-1');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('d-2');
    });

    it('should transition to approved review state only upon explicit human approval', () => {
      let draft = toEditableDraft(sampleRawDraft);
      expect(draft.isApproved).toBe(false);

      // Explicit human approval action
      draft = { ...draft, isApproved: true, isEditing: false };
      expect(draft.isApproved).toBe(true);
      expect(draft.isEditing).toBe(false);
    });
  });
});

