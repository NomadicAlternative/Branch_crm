import type { McpActor } from '@crm/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE = 'crm_rama_session';

export interface SessionData {
  accessToken: string;
  actor: McpActor;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as SessionData;

    if (!parsed?.accessToken || !parsed?.actor) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function encodeSession(session: SessionData) {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}
