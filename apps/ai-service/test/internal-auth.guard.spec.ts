import { describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { InternalAuthGuard } from '../src/common/guards/internal-auth.guard.js';

describe('InternalAuthGuard (ai-service)', () => {
  let guard: InternalAuthGuard;

  beforeEach(() => {
    process.env.INTERNAL_API_KEY = 'test-internal-secret';
    guard = new InternalAuthGuard();
  });

  function createMockContext(headers: Record<string, string | undefined>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should reject request when x-internal-secret is missing', () => {
    const context = createMockContext({});
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should reject request when x-internal-secret is invalid', () => {
    const context = createMockContext({ 'x-internal-secret': 'wrong-secret' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow request when x-internal-secret matches', () => {
    const context = createMockContext({ 'x-internal-secret': 'test-internal-secret' });
    expect(guard.canActivate(context)).toBe(true);
  });
});
