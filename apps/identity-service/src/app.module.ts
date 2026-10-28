import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';

@Module({
  imports: [PrismaModule, ProfileModule],
})
export class AppModule {}
