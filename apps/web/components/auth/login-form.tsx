'use client';

import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@crm/ui';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('presidente.rama@crm.local');
  const [password, setPassword] = useState('changeme123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/session/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? 'No se pudo iniciar sesión');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="login-card">
      <CardHeader>
        <CardTitle>Entrar al CRM</CardTitle>
        <CardDescription>Autenticación inicial con JWT sobre la API NestJS.</CardDescription>
      </CardHeader>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>

        <div className="hint-box">
          Usuario seed inicial: <strong>presidente.rama@crm.local</strong>
        </div>
      </form>
    </Card>
  );
}
