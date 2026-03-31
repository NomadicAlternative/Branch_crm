import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { McpActor } from '@crm/shared';
import { AuthService } from './auth.service';

export interface RequestWithAuth {
  authActor?: McpActor;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth & { headers?: Record<string, string | string[] | undefined> }>();
    const header = request.headers?.authorization;

    if (!header || Array.isArray(header)) {
      throw new UnauthorizedException('AUTH_HEADER_REQUERIDO');
    }

    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('TOKEN_BEARER_INVALIDO');
    }

    request.authActor = await this.authService.authenticateToken(token);
    return true;
  }
}
