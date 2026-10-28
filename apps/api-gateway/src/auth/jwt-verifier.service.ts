import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { jwtVerify, createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';

export interface VerifiedUserClaims {
  id: string;
  email?: string;
  role?: string;
  rawPayload: Record<string, unknown>;
}

@Injectable()
export class JwtVerifierService {
  private readonly logger = new Logger(JwtVerifierService.name);
  private jwksKeySet?: JWTVerifyGetKey;

  constructor() {
    this.initJwks();
  }

  private initJwks() {
    const jwksUrl =
      process.env.SUPABASE_JWKS_URL ||
      (process.env.SUPABASE_URL
        ? `${process.env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`
        : undefined);

    if (jwksUrl) {
      try {
        this.jwksKeySet = createRemoteJWKSet(new URL(jwksUrl));
        this.logger.log(`Initialized remote JWKS from: ${jwksUrl}`);
      } catch (err) {
        this.logger.warn(`Failed to parse JWKS URL ${jwksUrl}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Cryptographically verifies a Supabase access token.
   * Validates signature, expiration, audience ('authenticated'), and issuer.
   */
  async verifyToken(token: string): Promise<VerifiedUserClaims> {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Authentication token is required');
    }

    const expectedAudience = 'authenticated';
    const supabaseUrl = process.env.SUPABASE_URL
      ? process.env.SUPABASE_URL.replace(/\/$/, '')
      : undefined;
    const expectedIssuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined;

    try {
      let payload: Record<string, unknown>;

      // 1. Try remote JWKS if configured
      if (this.jwksKeySet) {
        const verifyOptions: Record<string, unknown> = {
          audience: expectedAudience,
        };
        if (expectedIssuer) {
          verifyOptions.issuer = expectedIssuer;
        }

        const result = await jwtVerify(token, this.jwksKeySet, verifyOptions);
        payload = result.payload as Record<string, unknown>;
      } else if (process.env.SUPABASE_JWT_SECRET) {
        // 2. Fallback to symmetric secret if specified
        const secretKey = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
        const verifyOptions: Record<string, unknown> = {
          audience: expectedAudience,
        };
        if (expectedIssuer) {
          verifyOptions.issuer = expectedIssuer;
        }

        const result = await jwtVerify(token, secretKey, verifyOptions);
        payload = result.payload as Record<string, unknown>;
      } else {
        throw new UnauthorizedException(
          'Gateway auth is misconfigured: neither SUPABASE_JWKS_URL, SUPABASE_URL, nor SUPABASE_JWT_SECRET is set',
        );
      }

      const userId = payload.sub;
      if (!userId || typeof userId !== 'string') {
        throw new UnauthorizedException('Token is missing valid sub claim');
      }

      return {
        id: userId,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        role: typeof payload.role === 'string' ? payload.role : undefined,
        rawPayload: payload,
      };
    } catch (error) {
      const err = error as Error;

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      if (err.name === 'JWTExpired') {
        throw new UnauthorizedException('Access token has expired');
      }
      if (err.name === 'JWSSignatureVerificationFailed') {
        throw new UnauthorizedException('Invalid token signature');
      }
      if (err.name === 'JWTClaimValidationFailed') {
        throw new UnauthorizedException(`Token validation failed: ${err.message}`);
      }

      this.logger.warn(`JWT verification error: ${err.message}`);
      throw new UnauthorizedException('Invalid or malformed authentication token');
    }
  }
}
