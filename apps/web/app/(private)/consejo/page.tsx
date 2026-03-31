import { Badge, Button, Card } from '@crm/ui';
import Link from 'next/link';
import { AcuerdosPanel } from '../../../components/consejo/acuerdos-panel';
import { getAcuerdosConsejo } from '../../../lib/api/mcp';
import { requireSession } from '../../../lib/auth/session';

export default async function ConsejoPage({
  searchParams,
}: {
  searchParams?: Promise<{ organizacion_id?: string; estado?: 'pendiente' | 'en_progreso' | 'completado' }>;
}) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const acuerdos = await getAcuerdosConsejo(session, {
    organizacion_id: params.organizacion_id,
    estado: params.estado,
  });

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Consejo</h1>
          <p>Actas y seguimiento de acuerdos sobre persistencia real en Prisma.</p>
        </div>

        <div className="header-actions">
          <Badge>{acuerdos.length} acuerdos</Badge>
          <Link href="/consejo/nueva-acta">
            <Button>Nueva acta</Button>
          </Link>
        </div>
      </header>

      <Card className="filters-card">
        <form className="members-filters" method="GET">
          <div className="field-grid two-columns">
            <div className="field">
              <label htmlFor="organizacion_id">Organización</label>
              <input className="ui-input" defaultValue={params.organizacion_id ?? ''} id="organizacion_id" name="organizacion_id" />
            </div>

            <div className="field">
              <label htmlFor="estado">Estado</label>
              <select className="ui-input" defaultValue={params.estado ?? ''} id="estado" name="estado">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit">Aplicar filtros</Button>
            <Link className="secondary-link" href="/consejo">
              Limpiar
            </Link>
          </div>
        </form>
      </Card>

      <AcuerdosPanel acuerdos={acuerdos} />
    </>
  );
}
