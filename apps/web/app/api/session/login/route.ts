import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { loginToApi } from '../../../../lib/api/auth';
import { encodeSession, SESSION_COOKIE } from '../../../../lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return NextResponse.json({ message: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const session = await loginToApi(body.email, body.password);
    const cookieStore = await cookies();

    cookieStore.set({
      name: SESSION_COOKIE,
      value: encodeSession(session),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo iniciar sesión' },
      { status: 401 },
    );
  }
}
