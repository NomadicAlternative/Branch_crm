import { NextResponse } from 'next/server';
import { createMiembro } from '../../../lib/api/mcp';
import { getSession } from '../../../lib/auth/session';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      nombre?: string;
      email?: string;
      telefono?: string;
      rol?: string;
      organizacion_id?: string;
    };

    if (!body.nombre || !body.email || !body.rol || !body.organizacion_id) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const miembro = await createMiembro(session, {
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono,
      rol: body.rol,
      organizacion_id: body.organizacion_id,
    });

    return NextResponse.json({ id: miembro.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo crear el miembro' },
      { status: 400 },
    );
  }
}
