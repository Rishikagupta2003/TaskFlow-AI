import {
  Controller,
  Get,
  Patch,
  Body,
  Headers,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard.js';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'identity-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/v1/profiles/me')
  @UseGuards(InternalAuthGuard)
  async getProfile(
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-email') email?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing authenticated user identity header');
    }
    const profile = await this.profileService.getProfile(userId, email);
    return {
      data: profile,
    };
  }

  @Patch('api/v1/profiles/me')
  @UseGuards(InternalAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async updateProfile(
    @Headers('x-user-id') userId: string | undefined,
    @Body() dto: UpdateProfileDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing authenticated user identity header');
    }
    const updated = await this.profileService.updateProfile(userId, dto);
    return {
      data: updated,
    };
  }
}
