import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotently retrieves a user profile, provisioning an initial record if not found.
   * Safe against concurrent first sign-ins using Prisma atomic upsert.
   */
  async getProfile(userId: string, email?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      return await this.prisma.userProfile.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: email ?? `user-${userId}@placeholder.local`,
          displayName: null,
          avatarUrl: null,
          bio: null,
          preferences: {},
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get or provision profile for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Updates only permitted profile fields (displayName, avatarUrl, bio, preferences).
   * Strictly prevents updating id, email, or timestamps.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const existing = await this.prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.preferences !== undefined) updateData.preferences = dto.preferences;

    try {
      return await this.prisma.userProfile.update({
        where: { id: userId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }
}
