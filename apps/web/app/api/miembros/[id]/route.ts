import { NextResponse } from 'next/server';
import { updateMiembro } from '../../../../lib/api/mcp';
import { getSession } from '../../../../lib/auth/session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      nombre?: string;
      email?: string;
      telefono?: string;
      rol?: string;
      organizacion_id?: string;
      activo?: boolean;
    };

    const miembro = await updateMiembro(session, id, {
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono,
      rol: body.rol,
      organizacion_id: body.organizacion_id,
      activo: body.activo,
    });

    return NextResponse.json({ id: miembro?.id ?? id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo actualizar el miembro' },
      { status: 400 },
    );
  }
}
