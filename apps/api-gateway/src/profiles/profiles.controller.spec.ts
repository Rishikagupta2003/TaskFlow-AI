import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpException, HttpStatus, BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { ProfilesController } from './profiles.controller.js';
import type { AuthenticatedRequest } from '../auth/supabase-auth.guard.js';

describe('ProfilesController (Routing & Downstream Error Handling Unit Tests)', () => {
  let controller: ProfilesController;
  const originalFetch = global.fetch;

  beforeEach(() => {
    controller = new ProfilesController();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function createMockRequest(userId = 'verified-user-1234', email = 'user@example.com'): AuthenticatedRequest {
    return {
      user: {
        id: userId,
        email,
        rawPayload: {},
      },
    } as unknown as AuthenticatedRequest;
  }

  describe('GET /api/v1/profiles/me routing', () => {
    it('should forward request to identity-service with internal secret and verified identity', async () => {
      const mockProfileResponse = {
        data: {
          id: 'verified-user-1234',
          email: 'user@example.com',
          displayName: 'Test User',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockProfileResponse,
      });

      const req = createMockRequest();
      const result = await controller.getMyProfile(req);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/api/v1/profiles/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'x-internal-secret': expect.any(String),
            'x-user-id': 'verified-user-1234',
            'x-user-email': 'user@example.com',
          }),
        }),
      );
      expect(result).toEqual(mockProfileResponse);
    });

    it('should map downstream 404 to an HttpException with status 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Profile not found' }),
      });

      const req = createMockRequest();
      await expect(controller.getMyProfile(req)).rejects.toThrow(HttpException);
      await expect(controller.getMyProfile(req)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should handle downstream network connection failure with BadGatewayException (502)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed: ECONNREFUSED'));

      const req = createMockRequest();
      await expect(controller.getMyProfile(req)).rejects.toThrow(BadGatewayException);
      await expect(controller.getMyProfile(req)).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('should handle downstream timeout with GatewayTimeoutException (504)', async () => {
      const timeoutError = new Error('The operation was aborted due to timeout');
      timeoutError.name = 'TimeoutError';
      global.fetch = vi.fn().mockRejectedValue(timeoutError);

      const req = createMockRequest();
      await expect(controller.getMyProfile(req)).rejects.toThrow(GatewayTimeoutException);
      await expect(controller.getMyProfile(req)).rejects.toMatchObject({
        status: HttpStatus.GATEWAY_TIMEOUT,
      });
    });
  });

  describe('PATCH /api/v1/profiles/me routing', () => {
    it('should forward request body and verified identity to identity-service', async () => {
      const mockUpdated = {
        data: {
          id: 'verified-user-1234',
          displayName: 'Updated Name',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockUpdated,
      });

      const req = createMockRequest();
      const body = { displayName: 'Updated Name' };
      const result = await controller.updateMyProfile(req, body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/api/v1/profiles/me',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-internal-secret': expect.any(String),
            'x-user-id': 'verified-user-1234',
          }),
          body: JSON.stringify(body),
        }),
      );
      expect(result).toEqual(mockUpdated);
    });
  });
});
