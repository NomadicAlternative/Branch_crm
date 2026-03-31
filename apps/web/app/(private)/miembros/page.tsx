import { Badge, Button, Card } from '@crm/ui';
import Link from 'next/link';
import { MiembrosTable } from '../../../components/miembros/miembros-table';
import { getMiembros } from '../../../lib/api/mcp';
import { requireSession } from '../../../lib/auth/session';

export default async function MiembrosPage({
  searchParams,
}: {
  searchParams?: Promise<{ organizacion_id?: string; incluir_inactivos?: string }>;
}) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};

  const response = await getMiembros(session, {
    organizacion_id: params.organizacion_id,
    incluir_inactivos: params.incluir_inactivos === 'true',
  });

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Miembros</h1>
          <p>Gestión inicial del padrón visible para el actor autenticado.</p>
        </div>

        <div className="header-actions">
          <Badge>{response.total} visibles</Badge>
          <Link href="/miembros/nuevo">
            <Button>Nuevo miembro</Button>
          </Link>
        </div>
      </header>

      <Card className="filters-card">
        <form className="members-filters" method="GET">
          <div className="field">
            <label htmlFor="organizacion_id">Filtrar por organización</label>
            <input className="ui-input" defaultValue={params.organizacion_id ?? ''} id="organizacion_id" name="organizacion_id" />
          </div>

          <label className="checkbox-field">
            <input defaultChecked={params.incluir_inactivos === 'true'} name="incluir_inactivos" type="checkbox" value="true" />
            Incluir inactivos
          </label>

          <div className="form-actions">
            <Button type="submit">Aplicar filtros</Button>
            <Link className="secondary-link" href="/miembros">
              Limpiar
            </Link>
          </div>
        </form>
      </Card>

      <MiembrosTable miembros={response.items} />
    </>
  );
}
