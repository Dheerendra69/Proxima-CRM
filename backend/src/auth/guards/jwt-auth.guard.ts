import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (info) {
      console.error('Passport Error Info:', info.message || info);
    }
    if (err || !user) {
      console.error('Passport Error Detail:', err);
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}