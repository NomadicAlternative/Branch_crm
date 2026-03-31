import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { McpActor } from '@crm/shared';
import { PrismaService } from '../prisma/prisma.service';

interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  level: number;
  organization_id: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { member: true },
    });

    if (!user || !user.member || !user.passwordHash) {
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }

    const actor: McpActor = {
      user_id: user.id,
      rol: user.role,
      organizacion_id: user.member.organizationId,
      nivel: user.level,
    };

    const token = jwt.sign(this.toClaims(actor, user.email), this.getJwtSecret(), {
      algorithm: 'HS256',
      expiresIn: '8h',
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      actor,
    };
  }

  async authenticateToken(token: string): Promise<McpActor> {
    try {
      const decoded = jwt.verify(token, this.getJwtSecret()) as JwtClaims;

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { member: true },
      });

      if (!user || !user.member) {
        throw new UnauthorizedException('TOKEN_INVALIDO');
      }

      return {
        user_id: user.id,
        rol: user.role,
        organizacion_id: user.member.organizationId,
        nivel: user.level,
      };
    } catch {
      throw new UnauthorizedException('TOKEN_INVALIDO');
    }
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.trim().length < 16) {
      throw new UnauthorizedException('JWT_SECRET_INVALIDO');
    }

    return secret;
  }

  private toClaims(actor: McpActor, email: string): JwtClaims {
    return {
      sub: actor.user_id,
      email,
      role: actor.rol,
      level: actor.nivel,
      organization_id: actor.organizacion_id,
    };
  }
}
