import { Controller, Get, Inject, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { ReportesBasePayload } from '@crm/shared';
import { AuthGuard, type RequestWithAuth } from '../auth/auth.guard';
import { ReportesService } from './reportes.service';

@UseGuards(AuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(@Inject(ReportesService) private readonly reportesService: ReportesService) {}

  @Get('resumen-organizacion')
  resumenOrganizacion(@Query() query: ReportesBasePayload, @Req() req: RequestWithAuth) {
    return this.reportesService.resumenOrganizacion(this.getActor(req), {
      organizacion_id: query.organizacion_id,
    });
  }

  @Get('indicadores')
  indicadores(@Query() query: ReportesBasePayload, @Req() req: RequestWithAuth) {
    return this.reportesService.indicadores(this.getActor(req), {
      organizacion_id: query.organizacion_id,
    });
  }

  @Get('alertas')
  alertas(@Query() query: ReportesBasePayload, @Req() req: RequestWithAuth) {
    return this.reportesService.alertas(this.getActor(req), {
      organizacion_id: query.organizacion_id,
    });
  }

  private getActor(req: RequestWithAuth) {
    if (!req.authActor) {
      throw new UnauthorizedException('ACTOR_AUTENTICADO_REQUERIDO');
    }

    return req.authActor;
  }
}
