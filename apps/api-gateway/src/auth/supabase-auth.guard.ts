import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtVerifierService, type VerifiedUserClaims } from './jwt-verifier.service.js';

export interface AuthenticatedRequest extends Request {
  user: VerifiedUserClaims;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly jwtVerifier: JwtVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Malformed Authorization header: Bearer token expected');
    }

    // Explicitly delete any spoofed identity headers incoming from the client
    delete request.headers['x-user-id'];
    delete request.headers['x-user-email'];
    delete request.headers['x-internal-secret'];

    // Cryptographically verify token
    const verifiedUser = await this.jwtVerifier.verifyToken(token);

    // Attach verified user claims strictly derived from token
    request.user = verifiedUser;

    return true;
  }
}
