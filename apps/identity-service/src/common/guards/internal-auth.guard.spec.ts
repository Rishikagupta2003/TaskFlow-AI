import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { InternalAuthGuard } from './internal-auth.guard.js';

describe('InternalAuthGuard (Unit Tests)', () => {
  let guard: InternalAuthGuard;
  const originalEnv = process.env.INTERNAL_API_KEY;

  beforeEach(() => {
    guard = new InternalAuthGuard();
    process.env.INTERNAL_API_KEY = 'test-secret-key-123';
  });

  afterEach(() => {
    process.env.INTERNAL_API_KEY = originalEnv;
  });

  function createMockContext(headers: Record<string, string | undefined>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow request when x-internal-secret matches INTERNAL_API_KEY', () => {
    const context = createMockContext({ 'x-internal-secret': 'test-secret-key-123' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject request with UnauthorizedException when x-internal-secret is missing', () => {
    const context = createMockContext({});
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow(
      'Unauthorized direct internal request: Missing or invalid x-internal-secret',
    );
  });

  it('should reject request with UnauthorizedException when x-internal-secret is invalid', () => {
    const context = createMockContext({ 'x-internal-secret': 'wrong-fake-secret' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
