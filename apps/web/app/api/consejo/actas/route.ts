import { NextResponse } from 'next/server';
import { createActaConsejo } from '../../../../lib/api/mcp';
import { getSession } from '../../../../lib/auth/session';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Sesión requerida' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      organizacion_id?: string;
      titulo?: string;
      resumen?: string;
      fecha_reunion?: string;
      acuerdos?: Array<{
        titulo?: string;
        descripcion?: string;
        responsable_user_id?: string;
        fecha_compromiso?: string;
      }>;
    };

    if (!body.organizacion_id || !body.titulo || !body.fecha_reunion || !body.acuerdos?.length) {
      return NextResponse.json({ message: 'Faltan campos requeridos del acta' }, { status: 400 });
    }

    const acta = await createActaConsejo(session, {
      organizacion_id: body.organizacion_id,
      titulo: body.titulo,
      resumen: body.resumen,
      fecha_reunion: body.fecha_reunion,
      acuerdos: body.acuerdos.map((acuerdo) => ({
        titulo: acuerdo.titulo ?? '',
        descripcion: acuerdo.descripcion,
        responsable_user_id: acuerdo.responsable_user_id ?? '',
        fecha_compromiso: acuerdo.fecha_compromiso,
      })),
    });

    return NextResponse.json({ id: (acta as { id?: string }).id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo crear el acta' },
      { status: 400 },
    );
  }
}
