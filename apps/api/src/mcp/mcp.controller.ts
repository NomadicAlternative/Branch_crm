import { Body, Controller, Inject, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { McpRequest } from '@crm/shared';
import { AuthGuard, type RequestWithAuth } from '../auth/auth.guard';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(@Inject(McpService) private readonly mcpService: McpService) {}

  @UseGuards(AuthGuard)
  @Post()
  handle(@Body() request: McpRequest, @Req() req: RequestWithAuth) {
    if (!req.authActor) {
      throw new UnauthorizedException('ACTOR_AUTENTICADO_REQUERIDO');
    }

    if (
      request.meta.actor.user_id !== req.authActor.user_id ||
      request.meta.actor.rol !== req.authActor.rol ||
      request.meta.actor.organizacion_id !== req.authActor.organizacion_id ||
      request.meta.actor.nivel !== req.authActor.nivel
    ) {
      throw new UnauthorizedException('ACTOR_TOKEN_MISMATCH');
    }

    return this.mcpService.handle({
      ...request,
      meta: {
        ...request.meta,
        actor: req.authActor,
      },
    });
  }
}
