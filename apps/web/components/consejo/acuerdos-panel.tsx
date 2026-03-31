'use client';

import { Badge, Button, Card, CardDescription, CardHeader, CardTitle } from '@crm/ui';
import type { AcuerdoConsejo } from '@crm/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { showToast } from '../../lib/ui/toast';

const ESTADOS = ['pendiente', 'en_progreso', 'completado'] as const;

export function AcuerdosPanel({ acuerdos }: { acuerdos: AcuerdoConsejo[] }) {
  const router = useRouter();
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateAgreement(acuerdoId: string, estado: (typeof ESTADOS)[number]) {
    setPendingId(acuerdoId);
    setError(null);

    try {
      const response = await fetch(`/api/consejo/acuerdos/${acuerdoId}/seguimiento`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado,
          comentario: comentarios[acuerdoId] || undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo actualizar el acuerdo');
      }

      showToast({ message: `Acuerdo actualizado a ${estado}.`, tone: 'success' });
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acuerdos</CardTitle>
        <CardDescription>Seguimiento operativo de acuerdos del consejo por estado y responsable.</CardDescription>
      </CardHeader>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="council-list">
        {acuerdos.length === 0 ? (
          <div className="summary-item">No hay acuerdos visibles para el scope actual.</div>
        ) : (
          acuerdos.map((acuerdo) => (
            <article className="council-item" key={acuerdo.id}>
              <div className="task-card-header">
                <div>
                  <strong>{acuerdo.titulo}</strong>
                  <p className="muted">{acuerdo.descripcion ?? 'Sin descripción'}</p>
                </div>
                <Badge tone={acuerdo.estado === 'completado' ? 'success' : acuerdo.estado === 'en_progreso' ? 'warning' : 'default'}>
                  {acuerdo.estado}
                </Badge>
              </div>

              <div className="task-meta-grid">
                <div>
                  <span className="muted">Responsable</span>
                  <strong>{acuerdo.responsable_user_id}</strong>
                </div>
                <div>
                  <span className="muted">Fecha compromiso</span>
                  <strong>{acuerdo.fecha_compromiso ?? 'Sin fecha'}</strong>
                </div>
                <div>
                  <span className="muted">Acta</span>
                  <strong>{acuerdo.acta_id}</strong>
                </div>
              </div>

              <div className="field">
                <label htmlFor={`comentario-${acuerdo.id}`}>Comentario de seguimiento</label>
                <textarea
                  className="ui-input textarea-input"
                  id={`comentario-${acuerdo.id}`}
                  value={comentarios[acuerdo.id] ?? acuerdo.comentario_seguimiento ?? ''}
                  onChange={(event) => setComentarios((current) => ({ ...current, [acuerdo.id]: event.target.value }))}
                />
              </div>

              <div className="form-actions">
                {ESTADOS.map((estado) => (
                  <Button key={estado} disabled={pendingId === acuerdo.id} onClick={() => void updateAgreement(acuerdo.id, estado)}>
                    {pendingId === acuerdo.id ? 'Guardando…' : `Marcar ${estado}`}
                  </Button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
