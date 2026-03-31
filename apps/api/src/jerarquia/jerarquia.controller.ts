import { Body, Controller, Get, Inject, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { CalcularNivelPayload, ObtenerSubordinadosPayload, ValidarAccesoPayload } from '@crm/shared';
import { AuthGuard, type RequestWithAuth } from '../auth/auth.guard';
import { JerarquiaService } from './jerarquia.service';

@UseGuards(AuthGuard)
@Controller('jerarquia')
export class JerarquiaController {
  constructor(@Inject(JerarquiaService) private readonly jerarquiaService: JerarquiaService) {}

  @Post('validar-acceso')
  validarAcceso(@Body() body: ValidarAccesoPayload, @Req() req: RequestWithAuth) {
    return this.jerarquiaService.validarAcceso(this.getActor(req), body);
  }

  @Post('subordinados')
  obtenerSubordinados(@Body() body: ObtenerSubordinadosPayload, @Req() req: RequestWithAuth) {
    return this.jerarquiaService.obtenerSubordinados(this.getActor(req), body);
  }

  @Get('calcular-nivel')
  calcularNivel(@Query() query: CalcularNivelPayload) {
    return this.jerarquiaService.calcularNivel(query);
  }

  private getActor(req: RequestWithAuth) {
    if (!req.authActor) {
      throw new UnauthorizedException('ACTOR_AUTENTICADO_REQUERIDO');
    }

    return req.authActor;
  }
}
