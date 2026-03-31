import 'reflect-metadata';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/crm_rama?schema=public';
process.env.JWT_SECRET ??= 'dev-only-secret-change-me';

import { AppModule } from '../src/app.module';

describe('MCP facade integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and returns a JWT plus actor', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'presidente.rama@crm.local',
        password: 'changeme123',
      })
      .expect(201);

    expect(response.body.access_token).toBeTypeOf('string');
    expect(response.body.token_type).toBe('Bearer');
    expect(response.body.actor).toMatchObject({
      user_id: 'u-rama-presidente',
      rol: 'presidente_rama',
      organizacion_id: 'rama-sud',
      nivel: 100,
    });
  });

  it('rejects MCP calls without bearer token', async () => {
    const response = await request(app.getHttpServer())
      .post('/mcp')
      .send({
        meta: {
          request_id: 'req-no-auth',
          timestamp: new Date().toISOString(),
          actor: {
            user_id: 'u-rama-presidente',
            rol: 'presidente_rama',
            organizacion_id: 'rama-sud',
            nivel: 100,
          },
        },
        intent: {
          domain: 'reportes',
          action: 'indicadores',
        },
        payload: {},
        context: {},
      })
      .expect(401);

    expect(response.body.message).toBe('AUTH_HEADER_REQUERIDO');
  });

  it('rejects MCP calls when actor mismatches token', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'presidente.rama@crm.local',
        password: 'changeme123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/mcp')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .send({
        meta: {
          request_id: 'req-mismatch',
          timestamp: new Date().toISOString(),
          actor: {
            user_id: 'u-miembro-jovenes',
            rol: 'miembro',
            organizacion_id: 'org-jovenes',
            nivel: 10,
          },
        },
        intent: {
          domain: 'reportes',
          action: 'indicadores',
        },
        payload: {},
        context: {},
      })
      .expect(401);

    expect(response.body.message).toBe('ACTOR_TOKEN_MISMATCH');
  });

  it('executes an authenticated MCP request successfully', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'presidente.rama@crm.local',
        password: 'changeme123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/mcp')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .send({
        meta: {
          request_id: 'req-indicadores',
          timestamp: new Date().toISOString(),
          actor: login.body.actor,
        },
        intent: {
          domain: 'reportes',
          action: 'indicadores',
        },
        payload: {},
        context: {},
      })
      .expect(201);

    expect(response.body.meta).toMatchObject({
      request_id: 'req-indicadores',
      status: 'success',
    });
    expect(response.body.data).toMatchObject({
      organizaciones_en_scope: 5,
      miembros_activos: 8,
      tareas_totales: 2,
      acuerdos_totales: 2,
    });
  });

  it('lists tasks through MCP for the authenticated actor', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'presidente.rama@crm.local',
        password: 'changeme123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/mcp')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .send({
        meta: {
          request_id: 'req-listar-tareas',
          timestamp: new Date().toISOString(),
          actor: login.body.actor,
        },
        intent: {
          domain: 'tareas',
          action: 'listar',
        },
        payload: {},
        context: {},
      })
      .expect(201);

    expect(response.body.meta).toMatchObject({
      request_id: 'req-listar-tareas',
      status: 'success',
    });
    expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    expect(response.body.data.items[0]).toMatchObject({
      id: expect.any(String),
      titulo: expect.any(String),
      organizacion_id: expect.any(String),
      estado: expect.any(String),
    });
  });

  it('returns MCP error envelope for invalid payloads', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'presidente.rama@crm.local',
        password: 'changeme123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/mcp')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .send({
        meta: {
          request_id: 'req-invalid-payload',
          timestamp: new Date().toISOString(),
          actor: login.body.actor,
        },
        intent: {
          domain: 'miembros',
          action: 'crear',
        },
        payload: {
          nombre: 'Sin Rol',
          email: 'sinrol@crm.local',
        },
        context: {},
      })
      .expect(201);

    expect(response.body.meta).toMatchObject({
      request_id: 'req-invalid-payload',
      status: 'error',
    });
    expect(response.body.error.code).toBe('INVALID_PAYLOAD');
  });
});
