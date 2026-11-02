import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpException, HttpStatus, BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import type { AuthenticatedRequest } from '../auth/supabase-auth.guard.js';

describe('AiController (API Gateway Routing & Error Handling Unit Tests)', () => {
  let controller: AiController;
  const originalFetch = global.fetch;

  beforeEach(() => {
    controller = new AiController();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function createMockRequest(userId = 'verified-user-ai-1234', email = 'ai-user@example.com'): AuthenticatedRequest {
    return {
      user: {
        id: userId,
        email,
        rawPayload: {},
      },
    } as unknown as AuthenticatedRequest;
  }

  describe('POST /api/v1/ai/task-drafts routing', () => {
    it('should forward request to ai-service on port 3003 with internal secret and user headers', async () => {
      const mockAiResponse = {
        data: {
          drafts: [
            {
              id: 'draft-1',
              title: 'Drafted Task',
              priority: 'HIGH',
            },
          ],
          provider: 'MockAiProvider (Offline Fallback)',
          disclaimer: 'Advisory only',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockAiResponse,
      });

      const req = createMockRequest();
      const body = { projectObjective: 'Build RBAC permissions matrix', maxDrafts: 3 };
      const result = await controller.generateTaskDrafts(req, body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/v1/ai/task-drafts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-internal-secret': expect.any(String),
            'x-user-id': 'verified-user-ai-1234',
            'x-user-email': 'ai-user@example.com',
          }),
          body: JSON.stringify(body),
        }),
      );
      expect(result).toEqual(mockAiResponse);
    });

    it('should map downstream errors to HttpException', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Project objective too short' }),
      });

      const req = createMockRequest();
      await expect(controller.generateTaskDrafts(req, { projectObjective: 'abc' })).rejects.toThrow(HttpException);
      await expect(controller.generateTaskDrafts(req, { projectObjective: 'abc' })).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should handle downstream network connection failure with BadGatewayException (502)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed: ECONNREFUSED'));

      const req = createMockRequest();
      await expect(controller.generateTaskDrafts(req, { projectObjective: 'Valid objective' })).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should handle downstream timeout with GatewayTimeoutException (504)', async () => {
      const timeoutError = new Error('The operation was aborted due to timeout');
      timeoutError.name = 'TimeoutError';
      global.fetch = vi.fn().mockRejectedValue(timeoutError);

      const req = createMockRequest();
      await expect(controller.generateTaskDrafts(req, { projectObjective: 'Valid objective' })).rejects.toThrow(
        GatewayTimeoutException,
      );
    });
  });

  describe('POST /api/v1/ai/project-summary routing', () => {
    it('should forward request to ai-service for project summary', async () => {
      const mockSummaryResponse = {
        data: {
          summary: {
            headline: 'Project Status: On Track',
            healthStatus: 'ON_TRACK',
            keyAchievements: ['All tasks done'],
            milestoneRisks: [],
          },
          provider: 'MockAiProvider (Offline Fallback)',
          disclaimer: 'Advisory only',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSummaryResponse,
      });

      const req = createMockRequest();
      const body = { projectName: 'Sprint 42', completedCount: 10, pendingCount: 2 };
      const result = await controller.summarizeProject(req, body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/v1/ai/project-summary',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-internal-secret': expect.any(String),
            'x-user-id': 'verified-user-ai-1234',
          }),
          body: JSON.stringify(body),
        }),
      );
      expect(result).toEqual(mockSummaryResponse);
    });
  });
});
