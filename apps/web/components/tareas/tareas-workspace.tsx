'use client';

import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@crm/ui';
import type { Miembro, Tarea } from '@crm/shared';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { showToast } from '../../lib/ui/toast';

interface TareasWorkspaceProps {
  tareas: Tarea[];
  miembros: Miembro[];
  actorOrganizationId: string;
}

export function TareasWorkspace({ tareas, miembros, actorOrganizationId }: TareasWorkspaceProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState(actorOrganizationId);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const activeMembers = useMemo(() => miembros.filter((miembro) => miembro.activo), [miembros]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/tareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: title,
          descripcion: description || undefined,
          organizacion_id: organizationId,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo crear la tarea');
      }

      setTitle('');
      setDescription('');
      showToast({ message: 'Tarea creada correctamente.', tone: 'success' });
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setIsCreating(false);
    }
  }

  async function assignTask(taskId: string, assignedUserId: string) {
    if (!assignedUserId) {
      return;
    }

    setPendingActionId(taskId);
    setError(null);

    try {
      const response = await fetch(`/api/tareas/${taskId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asignado_a_user_id: assignedUserId }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo asignar la tarea');
      }

      showToast({ message: 'Tarea asignada correctamente.', tone: 'success' });
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setPendingActionId(null);
    }
  }

  async function completeTask(taskId: string) {
    setPendingActionId(taskId);
    setError(null);

    try {
      const response = await fetch(`/api/tareas/${taskId}/complete`, {
        method: 'POST',
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo completar la tarea');
      }

      showToast({ message: 'Tarea marcada como completada.', tone: 'success' });
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="tasks-layout">
      <Card>
        <CardHeader>
          <CardTitle>Nueva tarea</CardTitle>
          <CardDescription>Creación inicial de tareas usando la fachada MCP autenticada.</CardDescription>
        </CardHeader>

        <form className="login-form" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="titulo">Título</label>
            <Input id="titulo" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              className="ui-input textarea-input"
              id="descripcion"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="organizacion_id">Organización</label>
            <Input
              id="organizacion_id"
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              required
            />
          </div>

          {error ? <div className="error-box">{error}</div> : null}
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creando…' : 'Crear tarea'}
          </Button>
        </form>
      </Card>

      <div className="tasks-list">
        {tareas.map((tarea) => {
          const matchingMembers = activeMembers.filter((miembro) => miembro.organizacion_id === tarea.organizacion_id);

          return (
            <Card key={tarea.id}>
              <div className="task-card-header">
                <div>
                  <strong>{tarea.titulo}</strong>
                  <p className="muted">{tarea.descripcion ?? 'Sin descripción'}</p>
                </div>
                <Badge tone={tarea.estado === 'completada' ? 'success' : tarea.estado === 'asignada' ? 'warning' : 'default'}>
                  {tarea.estado}
                </Badge>
              </div>

              <div className="task-meta-grid">
                <div>
                  <span className="muted">Organización</span>
                  <strong>{tarea.organizacion_id}</strong>
                </div>
                <div>
                  <span className="muted">Creada por</span>
                  <strong>{tarea.creado_por_user_id}</strong>
                </div>
                <div>
                  <span className="muted">Asignada a</span>
                  <strong>{tarea.asignado_a_user_id ?? 'Sin asignar'}</strong>
                </div>
              </div>

              <div className="task-actions">
                {tarea.estado !== 'completada' ? (
                  <label className="field task-assign-field">
                    <span>Asignar a</span>
                    <select
                      className="ui-input"
                      defaultValue=""
                      onChange={(event) => {
                        void assignTask(tarea.id, event.target.value);
                        event.currentTarget.value = '';
                      }}
                    >
                      <option value="">Seleccionar miembro</option>
                      {matchingMembers.map((miembro) => (
                        <option key={miembro.user_id} value={miembro.user_id}>
                          {miembro.nombre} — {miembro.rol}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {tarea.estado !== 'completada' ? (
                  <Button disabled={pendingActionId === tarea.id} onClick={() => void completeTask(tarea.id)}>
                    {pendingActionId === tarea.id ? 'Actualizando…' : 'Marcar completada'}
                  </Button>
                ) : (
                  <span className="muted">Completada: {tarea.completado_en ?? 'sin fecha'}</span>
                )}
              </div>
            </Card>
          );
        })}

        {tareas.length === 0 ? <Card>No hay tareas cargadas para el scope actual.</Card> : null}
      </div>
    </div>
  );
}
