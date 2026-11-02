import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AiService } from './ai.service.js';
import { GenerateDraftsDto } from './dto/generate-drafts.dto.js';
import { SummarizeProjectDto } from './dto/summarize-project.dto.js';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard.js';

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'ai-service',
      activeProvider: this.aiService.getActiveProvider().providerName,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('api/v1/ai/task-drafts')
  @UseGuards(InternalAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async generateTaskDrafts(@Body() dto: GenerateDraftsDto) {
    const result = await this.aiService.generateTaskDrafts({
      projectObjective: dto.projectObjective,
      projectId: dto.projectId,
      maxDrafts: dto.maxDrafts,
    });

    return {
      data: result,
    };
  }

  @Post('api/v1/ai/project-summary')
  @UseGuards(InternalAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async summarizeProject(@Body() dto: SummarizeProjectDto) {
    const result = await this.aiService.summarizeProject({
      projectName: dto.projectName,
      completedCount: dto.completedCount,
      pendingCount: dto.pendingCount,
      milestoneNotes: dto.milestoneNotes,
    });

    return {
      data: result,
    };
  }
}
