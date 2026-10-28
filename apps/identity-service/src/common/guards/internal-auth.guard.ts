import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const internalSecret = request.headers['x-internal-secret'];
    const expectedSecret = process.env.INTERNAL_API_KEY || 'taskflow-internal-dev-secret';

    if (!internalSecret || internalSecret !== expectedSecret) {
      throw new UnauthorizedException(
        'Unauthorized direct internal request: Missing or invalid x-internal-secret',
      );
    }

    return true;
  }
}
