import { Inject, Injectable } from '@nestjs/common';
import type {
  CalcularNivelPayload,
  CalcularNivelResultado,
  McpActor,
  ObtenerSubordinadosPayload,
  ObtenerSubordinadosResultado,
  OrganizacionJerarquica,
  UsuarioJerarquico,
  ValidarAccesoPayload,
  ValidarAccesoResultado,
} from '@crm/shared';
import { PrismaService } from '../prisma/prisma.service';

const ROLE_LEVELS: Record<string, number> = {
  presidente_rama: 100,
  consejero_rama: 90,
  presidente_organizacion: 80,
  consejero_organizacion: 70,
  miembro: 10,
};

@Injectable()
export class JerarquiaService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async validarAcceso(actor: McpActor, payload: ValidarAccesoPayload): Promise<ValidarAccesoResultado> {
    const actorScope = await this.getAccessibleOrganizationIds(actor.organizacion_id);

    if (payload.target_user_id) {
      const targetUser = await this.findUserById(payload.target_user_id);

      if (!targetUser) {
        return {
          allowed: false,
          reason: 'TARGET_USER_NOT_FOUND',
          actor_scope: actorScope,
        };
      }

      if (!actorScope.includes(targetUser.organizacion_id)) {
        return {
          allowed: false,
          reason: 'OUT_OF_SCOPE_ORGANIZATION',
          actor_scope: actorScope,
          target_level: targetUser.nivel,
        };
      }

      if (actor.nivel <= targetUser.nivel) {
        return {
          allowed: false,
          reason: 'INSUFFICIENT_LEVEL',
          actor_scope: actorScope,
          target_level: targetUser.nivel,
        };
      }

      if (payload.required_min_level !== undefined && actor.nivel < payload.required_min_level) {
        return {
          allowed: false,
          reason: 'INSUFFICIENT_LEVEL',
          actor_scope: actorScope,
          target_level: targetUser.nivel,
        };
      }

      return {
        allowed: true,
        reason: 'ACCESS_GRANTED',
        actor_scope: actorScope,
        target_level: targetUser.nivel,
      };
    }

    if (payload.target_organizacion_id) {
      const targetOrganization = await this.findOrganizationById(payload.target_organizacion_id);

      if (!targetOrganization) {
        return {
          allowed: false,
          reason: 'TARGET_ORG_NOT_FOUND',
          actor_scope: actorScope,
        };
      }

      const allowed = actorScope.includes(targetOrganization.id);

      return {
        allowed,
        reason: allowed ? 'ACCESS_GRANTED' : 'OUT_OF_SCOPE_ORGANIZATION',
        actor_scope: actorScope,
      };
    }

    return {
      allowed: false,
      reason: 'INVALID_TARGET',
      actor_scope: actorScope,
    };
  }

  async obtenerSubordinados(
    actor: McpActor,
    payload: ObtenerSubordinadosPayload = {},
  ): Promise<ObtenerSubordinadosResultado> {
    const scope = await this.getAccessibleOrganizationIds(actor.organizacion_id);
    const organizations = await this.prisma.organization.findMany({
      where: { id: { in: scope.filter((id) => id !== actor.organizacion_id) } },
      orderBy: { level: 'desc' },
    });

    const organizaciones = organizations.map((organization) => ({
      id: organization.id,
      nombre: organization.name,
      parent_id: organization.parentId,
      nivel: organization.level,
    }));

    const usuarios = payload.include_users
      ? await this.getUsersInScope(scope, actor.nivel)
      : [];

    return { organizaciones, usuarios };
  }

  async calcularNivel(payload: CalcularNivelPayload): Promise<CalcularNivelResultado> {
    if (payload.user_id) {
      const user = await this.findUserById(payload.user_id);

      return user
        ? { nivel: user.nivel, source: 'user-record' }
        : { nivel: null, source: 'not-found' };
    }

    if (payload.rol) {
      const nivel = ROLE_LEVELS[payload.rol];

      return nivel !== undefined
        ? { nivel, source: 'role-map' }
        : { nivel: null, source: 'not-found' };
    }

    return { nivel: null, source: 'not-found' };
  }

  async getAccessibleOrganizationIds(rootOrganizationId: string): Promise<string[]> {
    const organizations = await this.prisma.organization.findMany({
      select: { id: true, name: true, parentId: true, level: true },
    });
    const visited = new Set<string>();
    const queue = [rootOrganizationId];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current || visited.has(current)) {
        continue;
      }

      visited.add(current);

      const children = organizations.filter((organization) => organization.parentId === current);
      for (const child of children) {
        queue.push(child.id);
      }
    }

    return [...visited];
  }

  async findUserById(userId: string): Promise<UsuarioJerarquico | undefined> {
    const member = await this.prisma.member.findFirst({
      where: { userId },
      include: { user: true },
    });

    if (!member) {
      return undefined;
    }

    return {
      user_id: member.user.id,
      nombre: member.user.displayName,
      rol: member.user.role,
      organizacion_id: member.organizationId,
      nivel: member.user.level,
    };
  }

  async findOrganizationById(organizationId: string): Promise<OrganizacionJerarquica | undefined> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return undefined;
    }

    return {
      id: organization.id,
      nombre: organization.name,
      parent_id: organization.parentId,
      nivel: organization.level,
    };
  }

  private async getUsersInScope(scope: string[], actorLevel: number): Promise<UsuarioJerarquico[]> {
    const members = await this.prisma.member.findMany({
      where: {
        organizationId: { in: scope },
        user: { level: { lt: actorLevel } },
      },
      include: { user: true },
      orderBy: [{ user: { level: 'desc' } }, { user: { displayName: 'asc' } }],
    });

    return members.map((member) => ({
      user_id: member.user.id,
      nombre: member.user.displayName,
      rol: member.user.role,
      organizacion_id: member.organizationId,
      nivel: member.user.level,
    }));
  }
}
