import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
})
export class AiModule {}
