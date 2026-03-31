import type { McpActor } from '@crm/shared';
import { getApiBaseUrl } from './config';

interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  actor: McpActor;
}

export async function loginToApi(email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json().catch(() => null)) as LoginResponse | { message?: string } | null;

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
      ? data.message
      : 'No se pudo iniciar sesión';
    throw new Error(message);
  }

  if (!data || !('access_token' in data) || !data.actor) {
    throw new Error('Respuesta inválida del backend');
  }

  return {
    accessToken: data.access_token,
    actor: data.actor,
  };
}
