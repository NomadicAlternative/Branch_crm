import { NextResponse } from 'next/server';
import { completeTarea } from '../../../../../lib/api/mcp';
import { getSession } from '../../../../../lib/auth/session';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const tarea = await completeTarea(session, {
      tarea_id: id,
    });

    return NextResponse.json({ id: tarea.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo completar la tarea' },
      { status: 400 },
    );
  }
}
