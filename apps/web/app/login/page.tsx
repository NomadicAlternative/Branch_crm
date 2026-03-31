import { Card, CardDescription, CardHeader, CardTitle } from '@crm/ui';
import { redirect } from 'next/navigation';
import { LoginForm } from '../../components/auth/login-form';
import { getSession } from '../../lib/auth/session';

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="login-page">
      <div className="login-layout">
        <Card className="login-hero">
          <div>
            <CardHeader>
              <CardTitle>CRM Rama</CardTitle>
              <CardDescription>
                Primer slice funcional del frontend conectado al backend NestJS vía JWT + MCP.
              </CardDescription>
            </CardHeader>
          </div>

          <div>
            <ul className="login-points">
              <li>Dashboard con resumen organizacional</li>
              <li>Indicadores y alertas consolidadas</li>
              <li>Base lista para miembros, tareas y consejo</li>
            </ul>
          </div>
        </Card>

        <LoginForm />
      </div>
    </main>
  );
}
