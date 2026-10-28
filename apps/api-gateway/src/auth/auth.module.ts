import { Module, Global } from '@nestjs/common';
import { JwtVerifierService } from './jwt-verifier.service.js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';

@Global()
@Module({
  providers: [JwtVerifierService, SupabaseAuthGuard],
  exports: [JwtVerifierService, SupabaseAuthGuard],
})
export class AuthModule {}
