import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  BadGatewayException,
  GatewayTimeoutException,
  Logger,
} from '@nestjs/common';
import { SupabaseAuthGuard, type AuthenticatedRequest } from '../auth/supabase-auth.guard.js';

@Controller('api/v1/ai')
@UseGuards(SupabaseAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  private get aiServiceUrl(): string {
    return (process.env.AI_SERVICE_URL || 'http://localhost:3003').replace(/\/$/, '');
  }

  private get internalApiKey(): string {
    return process.env.INTERNAL_API_KEY || 'taskflow-internal-dev-secret';
  }

  @Post('task-drafts')
  async generateTaskDrafts(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const verifiedUser = req.user;
    const url = `${this.aiServiceUrl}/api/v1/ai/task-drafts`;

    return this.forwardRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': this.internalApiKey,
        'x-user-id': verifiedUser.id,
        ...(verifiedUser.email && { 'x-user-email': verifiedUser.email }),
      },
      body: JSON.stringify(body),
    });
  }

  @Post('project-summary')
  async summarizeProject(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const verifiedUser = req.user;
    const url = `${this.aiServiceUrl}/api/v1/ai/project-summary`;

    return this.forwardRequest(url, {
      method: 'POST',
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
        signal: AbortSignal.timeout(10000), // 10-second timeout for AI requests
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const status = response.status;
        const message =
          responseData?.message || responseData?.error || 'Downstream AI request failed';
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
        this.logger.error(`Timeout routing to ai-service at ${url}`);
        throw new GatewayTimeoutException({
          error: {
            code: 'GATEWAY_TIMEOUT',
            message: 'AI service request timed out',
          },
        });
      }

      this.logger.error(`Error routing to ai-service: ${err.message}`);
      throw new BadGatewayException({
        error: {
          code: 'BAD_GATEWAY',
          message: 'Unable to reach AI service',
        },
      });
    }
  }
}
