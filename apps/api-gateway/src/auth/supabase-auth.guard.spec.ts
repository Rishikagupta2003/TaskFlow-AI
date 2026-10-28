import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { SignJWT } from 'jose';
import { SupabaseAuthGuard, type AuthenticatedRequest } from './supabase-auth.guard.js';
import { JwtVerifierService } from './jwt-verifier.service.js';

describe('SupabaseAuthGuard & JwtVerifierService (Cryptographic Unit Tests)', () => {
  let guard: SupabaseAuthGuard;
  let verifier: JwtVerifierService;
  const testSecret = 'test-symmetric-jwt-secret-at-least-32-chars-long!!';
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SUPABASE_JWT_SECRET = testSecret;
    delete process.env.SUPABASE_JWKS_URL;
    delete process.env.SUPABASE_URL;

    verifier = new JwtVerifierService();
    guard = new SupabaseAuthGuard(verifier);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function createMockContext(headers: Record<string, string | undefined>): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = {
      headers: { ...headers },
      user: undefined,
    } as unknown as AuthenticatedRequest;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  async function createSignedToken(payload: Record<string, unknown>, secret = testSecret, options?: { exp?: string }) {
    const encoder = new TextEncoder();
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setAudience('authenticated')
      .setExpirationTime(options?.exp ?? '1h')
      .sign(encoder.encode(secret));
  }

  describe('Authorization Header Validation', () => {
    it('should reject missing Authorization header with 401', async () => {
      const { context } = createMockContext({});
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Missing Authorization header');
    });

    it('should reject malformed Authorization header (no Bearer scheme) with 401', async () => {
      const { context } = createMockContext({ authorization: 'Basic dXNlcjpwYXNz' });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Bearer token expected');
    });

    it('should reject empty token after Bearer scheme with 401', async () => {
      const { context } = createMockContext({ authorization: 'Bearer ' });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Cryptographic JWT Validation', () => {
    it('should verify valid Supabase token and attach verified user claims', async () => {
      const token = await createSignedToken({
        sub: '33333333-3333-3333-3333-333333333333',
        email: 'authenticated-user@example.com',
        role: 'authenticated',
      });

      const { context, request } = createMockContext({ authorization: `Bearer ${token}` });
      const allowed = await guard.canActivate(context);

      expect(allowed).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.id).toBe('33333333-3333-3333-3333-333333333333');
      expect(request.user.email).toBe('authenticated-user@example.com');
    });

    it('should reject token with invalid signature with 401', async () => {
      const wrongSecret = 'completely-wrong-secret-signature-key-1234!';
      const token = await createSignedToken(
        { sub: '33333333-3333-3333-3333-333333333333' },
        wrongSecret,
      );

      const { context } = createMockContext({ authorization: `Bearer ${token}` });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token signature');
    });

    it('should reject expired token with 401', async () => {
      // Create token that expired 10 seconds ago
      const encoder = new TextEncoder();
      const expiredToken = await new SignJWT({
        sub: '33333333-3333-3333-3333-333333333333',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setAudience('authenticated')
        .setExpirationTime('-10s')
        .sign(encoder.encode(testSecret));

      const { context } = createMockContext({ authorization: `Bearer ${expiredToken}` });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Access token has expired');
    });

    it('should reject token with wrong audience with 401', async () => {
      const encoder = new TextEncoder();
      const wrongAudToken = await new SignJWT({
        sub: '33333333-3333-3333-3333-333333333333',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setAudience('wrong-audience')
        .setExpirationTime('1h')
        .sign(encoder.encode(testSecret));

      const { context } = createMockContext({ authorization: `Bearer ${wrongAudToken}` });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Token validation failed');
    });

    it('should reject token with wrong issuer when SUPABASE_URL is configured', async () => {
      process.env.SUPABASE_URL = 'https://valid-project.supabase.co';
      verifier = new JwtVerifierService();
      guard = new SupabaseAuthGuard(verifier);

      const encoder = new TextEncoder();
      const wrongIssuerToken = await new SignJWT({
        sub: '33333333-3333-3333-3333-333333333333',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setAudience('authenticated')
        .setIssuer('https://malicious-site.com/auth/v1')
        .setExpirationTime('1h')
        .sign(encoder.encode(testSecret));

      const { context } = createMockContext({ authorization: `Bearer ${wrongIssuerToken}` });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject token missing sub claim with 401', async () => {
      const token = await createSignedToken({}); // No sub claim

      const { context } = createMockContext({ authorization: `Bearer ${token}` });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Token is missing valid sub claim');
    });
  });

  describe('Client Header Spoofing Prevention', () => {
    it('should strip spoofed client identity headers before forwarding', async () => {
      const token = await createSignedToken({
        sub: 'legitimate-uuid-1111',
        email: 'legit@example.com',
      });

      const { context, request } = createMockContext({
        authorization: `Bearer ${token}`,
        'x-user-id': 'spoofed-admin-uuid-9999',
        'x-user-email': 'spoofed-admin@example.com',
        'x-internal-secret': 'spoofed-secret-attempt',
      });

      await guard.canActivate(context);

      // Verify incoming spoofed headers were completely stripped
      expect(request.headers['x-user-id']).toBeUndefined();
      expect(request.headers['x-user-email']).toBeUndefined();
      expect(request.headers['x-internal-secret']).toBeUndefined();

      // Verify identity is strictly derived from token
      expect(request.user.id).toBe('legitimate-uuid-1111');
      expect(request.user.email).toBe('legit@example.com');
    });
  });
});
