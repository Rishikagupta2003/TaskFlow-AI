import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ProfileService (Mocked Unit Tests)', () => {
  let service: ProfileService;
  let mockPrisma: {
    userProfile: {
      upsert: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const sampleUserId = '11111111-1111-1111-1111-111111111111';
  const sampleEmail = 'testuser@example.com';

  beforeEach(() => {
    mockPrisma = {
      userProfile: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new ProfileService(mockPrisma as unknown as PrismaService);
  });

  describe('getProfile (idempotent provisioning)', () => {
    it('should provision initial profile on first retrieval via atomic upsert', async () => {
      const createdRecord = {
        id: sampleUserId,
        email: sampleEmail,
        displayName: null,
        avatarUrl: null,
        bio: null,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.userProfile.upsert.mockResolvedValue(createdRecord);

      const result = await service.getProfile(sampleUserId, sampleEmail);

      expect(mockPrisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { id: sampleUserId },
        update: {},
        create: {
          id: sampleUserId,
          email: sampleEmail,
          displayName: null,
          avatarUrl: null,
          bio: null,
          preferences: {},
        },
      });
      expect(result).toEqual(createdRecord);
    });

    it('should throw BadRequestException if userId is empty', async () => {
      await expect(service.getProfile('')).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors when upsert fails', async () => {
      mockPrisma.userProfile.upsert.mockRejectedValue(new Error('DB connection error'));

      await expect(service.getProfile(sampleUserId, sampleEmail)).rejects.toThrow(
        'DB connection error',
      );
    });
  });

  describe('updateProfile (field allowlist enforcement)', () => {
    it('should successfully update only permitted profile fields', async () => {
      const existingProfile = {
        id: sampleUserId,
        email: sampleEmail,
        displayName: 'Old Name',
        avatarUrl: null,
        bio: null,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProfile = {
        ...existingProfile,
        displayName: 'New Name',
        bio: 'Updated bio',
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(existingProfile);
      mockPrisma.userProfile.update.mockResolvedValue(updatedProfile);

      const updateDto = {
        displayName: 'New Name',
        bio: 'Updated bio',
      };

      const result = await service.updateProfile(sampleUserId, updateDto);

      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { id: sampleUserId },
      });
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: sampleUserId },
        data: {
          displayName: 'New Name',
          bio: 'Updated bio',
        },
      });
      expect(result.displayName).toBe('New Name');
    });

    it('should throw NotFoundException if user profile does not exist', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile(sampleUserId, { displayName: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should never include id, email, or timestamps in update data payload', async () => {
      const existingProfile = {
        id: sampleUserId,
        email: sampleEmail,
        displayName: 'Original',
        avatarUrl: null,
        bio: null,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(existingProfile);
      mockPrisma.userProfile.update.mockResolvedValue(existingProfile);

      // Pass an object attempting to inject prohibited fields
      const maliciousPayload = {
        displayName: 'Allowed Name',
        id: '22222222-2222-2222-2222-222222222222',
        email: 'hacked@example.com',
        createdAt: new Date(),
      };

      await service.updateProfile(sampleUserId, maliciousPayload as any);

      // Verify that update was called ONLY with displayName
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: sampleUserId },
        data: { displayName: 'Allowed Name' },
      });
    });
  });
});
