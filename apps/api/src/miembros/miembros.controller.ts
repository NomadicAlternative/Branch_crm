import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { ActualizarMiembroPayload, CrearMiembroPayload, ListarMiembrosPayload } from '@crm/shared';
import { AuthGuard, type RequestWithAuth } from '../auth/auth.guard';
import { MiembrosService } from './miembros.service';

interface MiembrosListQuery extends ListarMiembrosPayload {
  organizacion_id?: string;
  incluir_inactivos?: boolean;
}

@UseGuards(AuthGuard)
@Controller('miembros')
export class MiembrosController {
  constructor(@Inject(MiembrosService) private readonly miembrosService: MiembrosService) {}

  @Post()
  crear(@Body() body: CrearMiembroPayload, @Req() req: RequestWithAuth) {
    return this.miembrosService.crear(this.getActor(req), body);
  }

  @Patch(':miembroId')
  actualizar(
    @Param('miembroId') miembroId: string,
    @Body() body: Omit<ActualizarMiembroPayload, 'miembro_id'>,
    @Req() req: RequestWithAuth,
  ) {
    return this.miembrosService.actualizar(this.getActor(req), {
      miembro_id: miembroId,
      ...body,
    });
  }

  @Get()
  listar(@Query() query: MiembrosListQuery, @Req() req: RequestWithAuth) {
    return this.miembrosService.listar(this.getActor(req), {
      organizacion_id: query.organizacion_id,
      incluir_inactivos: query.incluir_inactivos,
    });
  }

  @Get(':miembroId')
  obtenerPorId(@Param('miembroId') miembroId: string, @Req() req: RequestWithAuth) {
    return this.miembrosService.obtenerPorId(this.getActor(req), { miembro_id: miembroId });
  }

  private getActor(req: RequestWithAuth) {
    if (!req.authActor) {
      throw new UnauthorizedException('ACTOR_AUTENTICADO_REQUERIDO');
    }

    return req.authActor;
  }
}
