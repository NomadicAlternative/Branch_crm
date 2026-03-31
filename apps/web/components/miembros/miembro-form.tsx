'use client';

import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@crm/ui';
import type { Miembro } from '@crm/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'presidente_rama', label: 'Presidente de rama' },
  { value: 'consejero_rama', label: 'Consejero de rama' },
  { value: 'presidente_organizacion', label: 'Presidente de organización' },
  { value: 'consejero_organizacion', label: 'Consejero de organización' },
  { value: 'miembro', label: 'Miembro' },
];

interface MiembroFormProps {
  mode: 'create' | 'edit';
  actorOrganizationId: string;
  miembro?: Miembro;
}

export function MiembroForm({ mode, actorOrganizationId, miembro }: MiembroFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState(miembro?.nombre ?? '');
  const [email, setEmail] = useState(miembro?.email ?? '');
  const [telefono, setTelefono] = useState(miembro?.telefono ?? '');
  const [rol, setRol] = useState(miembro?.rol ?? 'miembro');
  const [organizacionId, setOrganizacionId] = useState(miembro?.organizacion_id ?? actorOrganizationId);
  const [activo, setActivo] = useState(miembro?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => (mode === 'create' ? 'Nuevo miembro' : 'Editar miembro'), [mode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = mode === 'create' ? '/api/miembros' : `/api/miembros/${miembro?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const payload = {
        nombre,
        email,
        telefono: telefono || undefined,
        rol,
        organizacion_id: organizacionId,
        ...(mode === 'edit' ? { activo } : {}),
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string; id?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo guardar el miembro');
      }

      router.push(mode === 'create' ? '/miembros' : `/miembros/${miembro?.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Alta y edición inicial conectadas al dominio `miembros` vía MCP.</CardDescription>
      </CardHeader>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <Input id="nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <Input id="telefono" value={telefono} onChange={(event) => setTelefono(event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="rol">Rol</label>
          <select id="rol" className="ui-input" value={rol} onChange={(event) => setRol(event.target.value)}>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="organizacion_id">Organización</label>
          <Input
            id="organizacion_id"
            value={organizacionId}
            onChange={(event) => setOrganizacionId(event.target.value)}
            required
          />
        </div>

        {mode === 'edit' ? (
          <label className="checkbox-field">
            <input checked={activo} onChange={(event) => setActivo(event.target.checked)} type="checkbox" />
            Miembro activo
          </label>
        ) : null}

        {error ? <div className="error-box">{error}</div> : null}

        <div className="form-actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : mode === 'create' ? 'Crear miembro' : 'Guardar cambios'}
          </Button>
          <Link className="secondary-link" href="/miembros">
            Volver al listado
          </Link>
        </div>
      </form>
    </Card>
  );
}
