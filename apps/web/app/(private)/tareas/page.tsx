import { Badge } from '@crm/ui';
import { TareasWorkspace } from '../../../components/tareas/tareas-workspace';
import { getMiembros, getTareas } from '../../../lib/api/mcp';
import { requireSession } from '../../../lib/auth/session';

export default async function TareasPage({
  searchParams,
}: {
  searchParams?: Promise<{ organizacion_id?: string; estado?: 'pendiente' | 'asignada' | 'completada' }>;
}) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};

  const [tareas, miembros] = await Promise.all([
    getTareas(session, {
      organizacion_id: params.organizacion_id,
      estado: params.estado,
    }),
    getMiembros(session, {
      incluir_inactivos: false,
    }),
  ]);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Tareas</h1>
          <p>Panel inicial para crear, asignar y completar tareas reales vía MCP.</p>
        </div>

        <div className="header-actions">
          <Badge>{tareas.total} tareas</Badge>
        </div>
      </header>

      <TareasWorkspace actorOrganizationId={session.actor.organizacion_id} miembros={miembros.items} tareas={tareas.items} />
    </>
  );
}
