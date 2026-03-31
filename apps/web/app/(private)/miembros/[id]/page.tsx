import { notFound } from 'next/navigation';
import { MiembroForm } from '../../../../components/miembros/miembro-form';
import { getMiembroById } from '../../../../lib/api/mcp';
import { requireSession } from '../../../../lib/auth/session';

export default async function MiembroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const miembro = await getMiembroById(session, id);

  if (!miembro) {
    notFound();
  }

  return <MiembroForm actorOrganizationId={session.actor.organizacion_id} miembro={miembro} mode="edit" />;
}
