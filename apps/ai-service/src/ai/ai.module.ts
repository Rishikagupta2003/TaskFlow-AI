import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { GeminiProvider } from '../providers/gemini.provider.js';
import { MockAiProvider } from '../providers/mock.provider.js';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard.js';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiProvider, MockAiProvider, InternalAuthGuard],
  exports: [AiService],
})
export class AiModule {}
