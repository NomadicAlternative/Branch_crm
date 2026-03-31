import { NextResponse } from 'next/server';
import { createTarea } from '../../../lib/api/mcp';
import { getSession } from '../../../lib/auth/session';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      titulo?: string;
      descripcion?: string;
      organizacion_id?: string;
    };

    if (!body.titulo || !body.organizacion_id) {
      return NextResponse.json({ message: 'Título y organización son requeridos' }, { status: 400 });
    }

    const tarea = await createTarea(session, {
      titulo: body.titulo,
      descripcion: body.descripcion,
      organizacion_id: body.organizacion_id,
    });

    return NextResponse.json({ id: tarea.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo crear la tarea' },
      { status: 400 },
    );
  }
}
