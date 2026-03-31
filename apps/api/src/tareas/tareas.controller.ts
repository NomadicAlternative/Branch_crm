import { Body, Controller, Inject, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { AsignarTareaPayload, CompletarTareaPayload, CrearTareaPayload } from '@crm/shared';
import { AuthGuard, type RequestWithAuth } from '../auth/auth.guard';
import { TareasService } from './tareas.service';

@UseGuards(AuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(@Inject(TareasService) private readonly tareasService: TareasService) {}

  @Post()
  crear(@Body() body: CrearTareaPayload, @Req() req: RequestWithAuth) {
    return this.tareasService.crear(this.getActor(req), body);
  }

  @Patch('asignar')
  asignar(@Body() body: AsignarTareaPayload, @Req() req: RequestWithAuth) {
    return this.tareasService.asignar(this.getActor(req), body);
  }

  @Patch('completar')
  completar(@Body() body: CompletarTareaPayload, @Req() req: RequestWithAuth) {
    return this.tareasService.completar(this.getActor(req), body);
  }

  private getActor(req: RequestWithAuth) {
    if (!req.authActor) {
      throw new UnauthorizedException('ACTOR_AUTENTICADO_REQUERIDO');
    }

    return req.authActor;
  }
}
