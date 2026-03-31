import { NextResponse } from 'next/server';
import { getSession } from '../../../../../../lib/auth/session';
import { seguimientoConsejo } from '../../../../../../lib/api/mcp';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      estado?: 'pendiente' | 'en_progreso' | 'completado';
      comentario?: string;
    };

    if (!body.estado) {
      return NextResponse.json({ message: 'El estado es requerido' }, { status: 400 });
    }

    const acuerdo = await seguimientoConsejo(session, {
      acuerdo_id: id,
      estado: body.estado,
      comentario: body.comentario,
    });

    return NextResponse.json({ id: acuerdo.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo actualizar el acuerdo' },
      { status: 400 },
    );
  }
}
