import { NextResponse } from 'next/server';
import { assignTarea } from '../../../../../lib/api/mcp';
import { getSession } from '../../../../../lib/auth/session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { asignado_a_user_id?: string };

    if (!body.asignado_a_user_id) {
      return NextResponse.json({ message: 'Debe indicar el usuario asignado' }, { status: 400 });
    }

    const tarea = await assignTarea(session, {
      tarea_id: id,
      asignado_a_user_id: body.asignado_a_user_id,
    });

    return NextResponse.json({ id: tarea.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo asignar la tarea' },
      { status: 400 },
    );
  }
}
