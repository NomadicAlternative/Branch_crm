import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, Stat } from '@crm/ui';
import type { AlertaReporte } from '@crm/shared';
import Link from 'next/link';
import { getAlertas, getIndicadores, getResumenOrganizacion } from '../../../lib/api/mcp';
import { requireSession } from '../../../lib/auth/session';

function getAlertTone(alerta: AlertaReporte): 'warning' | 'danger' | 'default' {
  if (alerta.severidad === 'alta') {
    return 'danger';
  }

  if (alerta.severidad === 'media') {
    return 'warning';
  }

  return 'default';
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams?: Promise<{ organizacion_id?: string }>;
}) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const payload = { organizacion_id: params.organizacion_id || undefined };

  const [resumen, indicadores, alertas] = await Promise.all([
    getResumenOrganizacion(session, payload),
    getIndicadores(session, payload),
    getAlertas(session, payload),
  ]);

  const alertasAltas = alertas.filter((alerta) => alerta.severidad === 'alta').length;
  const alertasMedias = alertas.filter((alerta) => alerta.severidad === 'media').length;

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Reportes</h1>
          <p>Vista ampliada de métricas operativas, salud del scope y alertas del CRM.</p>
        </div>

        <div className="header-actions">
          <Badge tone="success">{resumen.nombre}</Badge>
        </div>
      </header>

      <Card className="filters-card">
        <form className="members-filters" method="GET">
          <div className="field">
            <label htmlFor="organizacion_id">Organización</label>
            <input className="ui-input" defaultValue={params.organizacion_id ?? ''} id="organizacion_id" name="organizacion_id" />
          </div>

          <div className="form-actions">
            <Button type="submit">Aplicar filtro</Button>
            <Link className="secondary-link" href="/reportes">
              Limpiar
            </Link>
          </div>
        </form>
      </Card>

      <section className="stats-grid">
        <Card>
          <Stat label="Miembros activos" value={indicadores.miembros_activos} helper={`${indicadores.miembros_inactivos} inactivos`} />
        </Card>
        <Card>
          <Stat label="Tareas" value={indicadores.tareas_totales} helper={`${indicadores.tareas_completadas} completadas`} />
        </Card>
        <Card>
          <Stat label="Acuerdos" value={indicadores.acuerdos_totales} helper={`${indicadores.acuerdos_abiertos} abiertos`} />
        </Card>
        <Card>
          <Stat label="Organizaciones" value={indicadores.organizaciones_en_scope} helper={`Scope desde ${payload.organizacion_id ?? session.actor.organizacion_id}`} />
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card>
          <div className="dashboard-section-header">
            <div>
              <h2>Resumen organizacional</h2>
              <p>Estado actual de la organización consultada.</p>
            </div>
            <Badge>{resumen.organizacion_id}</Badge>
          </div>

          <div className="summary-list">
            <div className="summary-item">
              <strong>Nombre</strong>
              <span>{resumen.nombre}</span>
            </div>
            <div className="summary-item">
              <strong>Organizaciones hijas</strong>
              <span>{resumen.organizaciones_hijas}</span>
            </div>
            <div className="summary-item">
              <strong>Tareas pendientes</strong>
              <span>{resumen.tareas_pendientes}</span>
            </div>
            <div className="summary-item">
              <strong>Tareas completadas</strong>
              <span>{resumen.tareas_completadas}</span>
            </div>
            <div className="summary-item">
              <strong>Acuerdos abiertos</strong>
              <span>{resumen.acuerdos_abiertos}</span>
            </div>
            <div className="summary-item">
              <strong>Última reunión</strong>
              <span>{resumen.ultima_reunion_consejo ?? 'Sin reunión registrada'}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="dashboard-section-header">
            <div>
              <h2>Indicadores de cumplimiento</h2>
              <p>Lectura rápida del desempeño del scope.</p>
            </div>
          </div>

          <div className="quick-links">
            <div className="quick-link">
              <strong>Cumplimiento de tareas</strong>
              <span>{indicadores.tasa_cumplimiento_tareas}%</span>
            </div>
            <div className="quick-link">
              <strong>Cumplimiento de acuerdos</strong>
              <span>{indicadores.tasa_cumplimiento_acuerdos}%</span>
            </div>
            <div className="quick-link">
              <strong>Alertas altas</strong>
              <span>{alertasAltas}</span>
            </div>
            <div className="quick-link">
              <strong>Alertas medias</strong>
              <span>{alertasMedias}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="reportes-grid">
        <Card>
          <CardHeader>
            <CardTitle>Alertas priorizadas</CardTitle>
            <CardDescription>Señales operativas ordenadas para actuar rápido.</CardDescription>
          </CardHeader>

          <div className="alerts-list">
            {alertas.length === 0 ? (
              <div className="summary-item">No hay alertas activas en este scope.</div>
            ) : (
              alertas.map((alerta) => (
                <div className="alerts-item" key={alerta.referencia_id}>
                  <div className="alerts-title">
                    <strong>{alerta.titulo}</strong>
                    <Badge tone={getAlertTone(alerta)}>{alerta.severidad}</Badge>
                  </div>
                  <span>{alerta.descripcion}</span>
                  <span className="muted">Organización: {alerta.organizacion_id}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lecturas rápidas</CardTitle>
            <CardDescription>Resumen ejecutivo para tomar decisiones rápidas.</CardDescription>
          </CardHeader>

          <div className="summary-list">
            <div className="summary-item">
              <strong>Tareas abiertas o vencidas</strong>
              <span>{indicadores.tareas_vencidas_o_abiertas}</span>
            </div>
            <div className="summary-item">
              <strong>Miembros inactivos</strong>
              <span>{indicadores.miembros_inactivos}</span>
            </div>
            <div className="summary-item">
              <strong>Acuerdos completados</strong>
              <span>{indicadores.acuerdos_completados}</span>
            </div>
            <div className="summary-item">
              <strong>Acuerdos abiertos</strong>
              <span>{indicadores.acuerdos_abiertos}</span>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
