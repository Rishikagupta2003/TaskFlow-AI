import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';

describe('ProfileController (Unit Tests)', () => {
  let controller: ProfileController;
  let mockProfileService: {
    getProfile: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
  };

  const sampleUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockProfileService = {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
    };

    controller = new ProfileController(mockProfileService as unknown as ProfileService);
  });

  describe('GET /health', () => {
    it('should return health status ok', () => {
      const result = controller.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('identity-service');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('GET /api/v1/profiles/me', () => {
    it('should return profile wrapped in data envelope when header is present', async () => {
      const mockProfile = { id: sampleUserId, email: 'user@example.com' };
      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(sampleUserId, 'user@example.com');

      expect(result).toEqual({ data: mockProfile });
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(sampleUserId, 'user@example.com');
    });

    it('should throw BadRequestException if x-user-id header is missing', async () => {
      await expect(controller.getProfile(undefined)).rejects.toThrow(BadRequestException);
    });
  });

  describe('PATCH /api/v1/profiles/me', () => {
    it('should update profile and return wrapped in data envelope', async () => {
      const mockUpdated = { id: sampleUserId, displayName: 'Updated' };
      mockProfileService.updateProfile.mockResolvedValue(mockUpdated);

      const dto = { displayName: 'Updated' };
      const result = await controller.updateProfile(sampleUserId, dto);

      expect(result).toEqual({ data: mockUpdated });
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(sampleUserId, dto);
    });

    it('should throw BadRequestException if x-user-id header is missing on patch', async () => {
      await expect(controller.updateProfile(undefined, { displayName: 'test' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
