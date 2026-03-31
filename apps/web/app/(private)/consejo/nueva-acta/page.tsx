import { ActaForm } from '../../../../components/consejo/acta-form';
import { getMiembros } from '../../../../lib/api/mcp';
import { requireSession } from '../../../../lib/auth/session';

export default async function NuevaActaPage() {
  const session = await requireSession();
  const miembros = await getMiembros(session, { incluir_inactivos: false });

  return <ActaForm actorOrganizationId={session.actor.organizacion_id} miembros={miembros.items} />;
}
