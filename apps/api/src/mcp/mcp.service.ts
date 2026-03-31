import { HttpException, Inject, Injectable } from '@nestjs/common';
import type {
  ActualizarMiembroPayload,
  AsignarTareaPayload,
  CalcularNivelPayload,
  CompletarTareaPayload,
  CrearActaConsejoPayload,
  CrearMiembroPayload,
  CrearTareaPayload,
  ListarTareasPayload,
  ListarAcuerdosConsejoPayload,
  ListarMiembrosPayload,
  McpRequest,
  McpResponse,
  ObtenerMiembroPorIdPayload,
  ObtenerTareaPorIdPayload,
  ObtenerSubordinadosPayload,
  ReportesBasePayload,
  SeguimientoConsejoPayload,
  ValidarAccesoPayload,
} from '@crm/shared';
import { ConsejoService } from '../consejo/consejo.service';
import { JerarquiaService } from '../jerarquia/jerarquia.service';
import { MiembrosService } from '../miembros/miembros.service';
import { ReportesService } from '../reportes/reportes.service';
import { TareasService } from '../tareas/tareas.service';
import { McpValidationError, validateMcpRequest } from './mcp.validation';

@Injectable()
export class McpService {
  constructor(
    @Inject(JerarquiaService) private readonly jerarquiaService: JerarquiaService,
    @Inject(MiembrosService) private readonly miembrosService: MiembrosService,
    @Inject(TareasService) private readonly tareasService: TareasService,
    @Inject(ConsejoService) private readonly consejoService: ConsejoService,
    @Inject(ReportesService) private readonly reportesService: ReportesService,
  ) {}

  async handle(request: McpRequest): Promise<McpResponse> {
    try {
      validateMcpRequest(request);

      const data = await this.dispatch(request);

      return {
        meta: {
          request_id: request.meta.request_id,
          status: 'success',
        },
        data: this.normalizeData(data),
      };
    } catch (error) {
      return this.toErrorResponse(request?.meta?.request_id ?? 'unknown', error);
    }
  }

  private async dispatch(request: McpRequest): Promise<unknown> {
    const actor = request.meta.actor;

    switch (request.intent.domain) {
      case 'jerarquia':
        return this.handleJerarquia(actor, request.intent.action, request.payload);
      case 'miembros':
        return this.handleMiembros(actor, request.intent.action, request.payload);
      case 'tareas':
        return this.handleTareas(actor, request.intent.action, request.payload);
      case 'consejo':
        return this.handleConsejo(actor, request.intent.action, request.payload);
      case 'reportes':
        return this.handleReportes(actor, request.intent.action, request.payload);
      default:
        throw new Error('UNSUPPORTED_DOMAIN');
    }
  }

  private handleJerarquia(actor: McpRequest['meta']['actor'], action: string, payload: Record<string, unknown>) {
    switch (action) {
      case 'validar_acceso':
        return this.jerarquiaService.validarAcceso(actor, this.asPayload<ValidarAccesoPayload>(payload));
      case 'obtener_subordinados':
        return this.jerarquiaService.obtenerSubordinados(actor, this.asPayload<ObtenerSubordinadosPayload>(payload));
      case 'calcular_nivel':
        return this.jerarquiaService.calcularNivel(this.asPayload<CalcularNivelPayload>(payload));
      default:
        throw new Error('UNSUPPORTED_ACTION');
    }
  }

  private handleMiembros(actor: McpRequest['meta']['actor'], action: string, payload: Record<string, unknown>) {
    switch (action) {
      case 'crear':
        return this.miembrosService.crear(actor, this.asPayload<CrearMiembroPayload>(payload));
      case 'actualizar':
        return this.miembrosService.actualizar(actor, this.asPayload<ActualizarMiembroPayload>(payload));
      case 'listar':
        return this.miembrosService.listar(actor, this.asPayload<ListarMiembrosPayload>(payload));
      case 'obtener_por_id':
        return this.miembrosService.obtenerPorId(actor, this.asPayload<ObtenerMiembroPorIdPayload>(payload));
      default:
        throw new Error('UNSUPPORTED_ACTION');
    }
  }

  private handleTareas(actor: McpRequest['meta']['actor'], action: string, payload: Record<string, unknown>) {
    switch (action) {
      case 'crear':
        return this.tareasService.crear(actor, this.asPayload<CrearTareaPayload>(payload));
      case 'asignar':
        return this.tareasService.asignar(actor, this.asPayload<AsignarTareaPayload>(payload));
      case 'completar':
        return this.tareasService.completar(actor, this.asPayload<CompletarTareaPayload>(payload));
      case 'listar':
        return this.tareasService.listar(actor, this.asPayload<ListarTareasPayload>(payload));
      case 'obtener_por_id':
        return this.tareasService.obtenerPorId(actor, this.asPayload<ObtenerTareaPorIdPayload>(payload));
      default:
        throw new Error('UNSUPPORTED_ACTION');
    }
  }

  private handleConsejo(actor: McpRequest['meta']['actor'], action: string, payload: Record<string, unknown>) {
    switch (action) {
      case 'crear_acta':
        return this.consejoService.crearActa(actor, this.asPayload<CrearActaConsejoPayload>(payload));
      case 'listar_acuerdos':
        return this.consejoService.listarAcuerdos(actor, this.asPayload<ListarAcuerdosConsejoPayload>(payload));
      case 'seguimiento':
        return this.consejoService.seguimiento(actor, this.asPayload<SeguimientoConsejoPayload>(payload));
      default:
        throw new Error('UNSUPPORTED_ACTION');
    }
  }

  private handleReportes(actor: McpRequest['meta']['actor'], action: string, payload: Record<string, unknown>) {
    switch (action) {
      case 'resumen_organizacion':
        return this.reportesService.resumenOrganizacion(actor, this.asPayload<ReportesBasePayload>(payload));
      case 'indicadores':
        return this.reportesService.indicadores(actor, this.asPayload<ReportesBasePayload>(payload));
      case 'alertas':
        return this.reportesService.alertas(actor, this.asPayload<ReportesBasePayload>(payload));
      default:
        throw new Error('UNSUPPORTED_ACTION');
    }
  }

  private toErrorResponse(requestId: string, error: unknown): McpResponse {
    if (error instanceof McpValidationError) {
      return {
        meta: {
          request_id: requestId,
          status: 'error',
        },
        data: {},
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    if (error instanceof HttpException) {
      const response = error.getResponse();
      const message = this.extractHttpMessage(response, error.message);

      return {
        meta: {
          request_id: requestId,
          status: 'error',
        },
        data: {},
        error: {
          code: this.normalizeErrorCode(message ?? error.name),
          message: message ?? error.message,
        },
      };
    }

    if (error instanceof Error) {
      return {
        meta: {
          request_id: requestId,
          status: 'error',
        },
        data: {},
        error: {
          code: this.normalizeErrorCode(error.message),
          message: error.message,
        },
      };
    }

    return {
      meta: {
        request_id: requestId,
        status: 'error',
      },
      data: {},
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown MCP processing error',
      },
    };
  }

  private normalizeErrorCode(value: string): string {
    return value.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
  }

  private normalizeData(data: unknown): Record<string, unknown> {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }

    return { result: data };
  }

  private asPayload<T>(payload: Record<string, unknown>): T {
    return payload as unknown as T;
  }

  private extractHttpMessage(response: unknown, fallback: string): string {
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object') {
      const message = (response as { message?: string | string[] }).message;

      if (Array.isArray(message)) {
        return message.join('; ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return fallback;
  }
}
