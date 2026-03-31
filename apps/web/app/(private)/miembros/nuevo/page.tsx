import { MiembroForm } from '../../../../components/miembros/miembro-form';
import { requireSession } from '../../../../lib/auth/session';

export default async function NuevoMiembroPage() {
  const session = await requireSession();

  return <MiembroForm actorOrganizationId={session.actor.organizacion_id} mode="create" />;
}
