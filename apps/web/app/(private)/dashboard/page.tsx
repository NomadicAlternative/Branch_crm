import { Badge, Card, CardDescription, CardHeader, CardTitle, Stat } from '@crm/ui';
import type { AlertaReporte } from '@crm/shared';
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

export default async function DashboardPage() {
  const session = await requireSession();

  try {
    const [resumen, indicadores, alertas] = await Promise.all([
      getResumenOrganizacion(session),
      getIndicadores(session),
      getAlertas(session),
    ]);

    return (
      <>
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Vista inicial conectada a reportes reales del backend mediante MCP autenticado.</p>
          </div>
          <Badge tone="success">Sesión activa</Badge>
        </header>

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
            <Stat label="Scope orgs" value={indicadores.organizaciones_en_scope} helper={`Org actual: ${session.actor.organizacion_id}`} />
          </Card>
        </section>

        <section className="dashboard-grid">
          <Card>
            <div className="dashboard-section-header">
              <div>
                <h2>Resumen organizacional</h2>
                <p>Estado operativo inmediato de la organización actual.</p>
              </div>
              <Badge>{resumen.nombre}</Badge>
            </div>

            <div className="summary-list">
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
                <span>{resumen.ultima_reunion_consejo ?? 'Sin registros recientes'}</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="dashboard-section-header">
              <div>
                <h2>Salud operativa</h2>
                <p>Indicadores y accesos rápidos para el siguiente sprint.</p>
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
                <strong>Siguiente módulo</strong>
                <span>Miembros + Tareas</span>
              </div>
            </div>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Alertas priorizadas</CardTitle>
            <CardDescription>Las primeras señales de seguimiento operativo del scope actual.</CardDescription>
          </CardHeader>

          <div className="alerts-list">
            {alertas.length === 0 ? (
              <div className="summary-item">No hay alertas activas.</div>
            ) : (
              alertas.slice(0, 6).map((alerta) => (
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
      </>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard no disponible</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'No se pudieron cargar los datos del dashboard.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
}
