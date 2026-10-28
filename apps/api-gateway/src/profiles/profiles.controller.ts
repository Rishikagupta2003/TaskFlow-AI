import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpException,
  BadGatewayException,
  GatewayTimeoutException,
  Logger,
} from '@nestjs/common';
import { SupabaseAuthGuard, type AuthenticatedRequest } from '../auth/supabase-auth.guard.js';

@Controller('api/v1/profiles')
@UseGuards(SupabaseAuthGuard)
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  private get identityServiceUrl(): string {
    return (process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002').replace(/\/$/, '');
  }

  private get internalApiKey(): string {
    return process.env.INTERNAL_API_KEY || 'taskflow-internal-dev-secret';
  }

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const verifiedUser = req.user;
    const url = `${this.identityServiceUrl}/api/v1/profiles/me`;

    return this.forwardRequest(url, {
      method: 'GET',
      headers: {
        'x-internal-secret': this.internalApiKey,
        'x-user-id': verifiedUser.id,
        ...(verifiedUser.email && { 'x-user-email': verifiedUser.email }),
      },
    });
  }

  @Patch('me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const verifiedUser = req.user;
    const url = `${this.identityServiceUrl}/api/v1/profiles/me`;

    return this.forwardRequest(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': this.internalApiKey,
        'x-user-id': verifiedUser.id,
        ...(verifiedUser.email && { 'x-user-email': verifiedUser.email }),
      },
      body: JSON.stringify(body),
    });
  }

  private async forwardRequest(
    url: string,
    options: { method: string; headers: Record<string, string>; body?: string },
  ) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(5000), // 5-second timeout
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const status = response.status;
        const message =
          responseData?.message || responseData?.error || 'Downstream request failed';
        throw new HttpException(
          {
            error: {
              code: responseData?.error?.code || `DOWNSTREAM_${status}`,
              message,
            },
          },
          status,
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const err = error as Error;
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        this.logger.error(`Timeout routing to identity-service at ${url}`);
        throw new GatewayTimeoutException({
          error: {
            code: 'GATEWAY_TIMEOUT',
            message: 'Identity service request timed out',
          },
        });
      }

      this.logger.error(`Error routing to identity-service: ${err.message}`);
      throw new BadGatewayException({
        error: {
          code: 'BAD_GATEWAY',
          message: 'Unable to reach identity service',
        },
      });
    }
  }
}
