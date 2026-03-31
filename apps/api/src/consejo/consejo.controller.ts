import { Body, Controller, Get, Inject, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { CrearActaConsejoPayload, ListarAcuerdosConsejoPayload, SeguimientoConsejoPayload } from '@crm/shared';
import { AuthGuard, type RequestWithAuth } from '../auth/auth.guard';
import { ConsejoService } from './consejo.service';

@UseGuards(AuthGuard)
@Controller('consejo')
export class ConsejoController {
  constructor(@Inject(ConsejoService) private readonly consejoService: ConsejoService) {}

  @Post('actas')
  crearActa(@Body() body: CrearActaConsejoPayload, @Req() req: RequestWithAuth) {
    return this.consejoService.crearActa(this.getActor(req), body);
  }

  @Get('acuerdos')
  listarAcuerdos(@Query() query: ListarAcuerdosConsejoPayload, @Req() req: RequestWithAuth) {
    return this.consejoService.listarAcuerdos(this.getActor(req), {
      organizacion_id: query.organizacion_id,
      estado: query.estado,
    });
  }

  @Patch('seguimiento')
  seguimiento(@Body() body: SeguimientoConsejoPayload, @Req() req: RequestWithAuth) {
    return this.consejoService.seguimiento(this.getActor(req), body);
  }

  private getActor(req: RequestWithAuth) {
    if (!req.authActor) {
      throw new UnauthorizedException('ACTOR_AUTENTICADO_REQUERIDO');
    }

    return req.authActor;
  }
}
