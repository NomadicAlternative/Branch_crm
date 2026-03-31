'use client';

import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@crm/ui';
import type { Miembro } from '@crm/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DraftAgreement {
  titulo: string;
  descripcion: string;
  responsable_user_id: string;
  fecha_compromiso: string;
}

export function ActaForm({ miembros, actorOrganizationId }: { miembros: Miembro[]; actorOrganizationId: string }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [fechaReunion, setFechaReunion] = useState(new Date().toISOString().slice(0, 16));
  const [organizacionId, setOrganizacionId] = useState(actorOrganizationId);
  const [acuerdos, setAcuerdos] = useState<DraftAgreement[]>([
    { titulo: '', descripcion: '', responsable_user_id: '', fecha_compromiso: '' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateAgreement(index: number, patch: Partial<DraftAgreement>) {
    setAcuerdos((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/consejo/actas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          resumen: resumen || undefined,
          fecha_reunion: new Date(fechaReunion).toISOString(),
          organizacion_id: organizacionId,
          acuerdos: acuerdos.map((acuerdo) => ({
            titulo: acuerdo.titulo,
            descripcion: acuerdo.descripcion || undefined,
            responsable_user_id: acuerdo.responsable_user_id,
            fecha_compromiso: acuerdo.fecha_compromiso ? new Date(acuerdo.fecha_compromiso).toISOString() : undefined,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo crear el acta');
      }

      router.push('/consejo');
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  }

  const availableMembers = miembros.filter((miembro) => miembro.activo && miembro.organizacion_id === organizacionId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva acta de consejo</CardTitle>
        <CardDescription>Creación de acta con acuerdos iniciales y responsables dentro de la organización objetivo.</CardDescription>
      </CardHeader>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="titulo">Título</label>
          <Input id="titulo" value={titulo} onChange={(event) => setTitulo(event.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="resumen">Resumen</label>
          <textarea className="ui-input textarea-input" id="resumen" value={resumen} onChange={(event) => setResumen(event.target.value)} />
        </div>

        <div className="field-grid two-columns">
          <div className="field">
            <label htmlFor="fecha_reunion">Fecha reunión</label>
            <Input id="fecha_reunion" type="datetime-local" value={fechaReunion} onChange={(event) => setFechaReunion(event.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="organizacion_id">Organización</label>
            <Input id="organizacion_id" value={organizacionId} onChange={(event) => setOrganizacionId(event.target.value)} required />
          </div>
        </div>

        <div className="section-stack">
          <div className="dashboard-section-header">
            <div>
              <h2>Acuerdos</h2>
              <p>Podés cargar uno o varios acuerdos desde la misma acta.</p>
            </div>
            <Button
              onClick={() =>
                setAcuerdos((current) => [...current, { titulo: '', descripcion: '', responsable_user_id: '', fecha_compromiso: '' }])
              }
              type="button"
            >
              Agregar acuerdo
            </Button>
          </div>

          {acuerdos.map((acuerdo, index) => (
            <div className="agreement-editor" key={index}>
              <div className="field-grid two-columns">
                <div className="field">
                  <label htmlFor={`acuerdo-titulo-${index}`}>Título del acuerdo</label>
                  <Input
                    id={`acuerdo-titulo-${index}`}
                    value={acuerdo.titulo}
                    onChange={(event) => updateAgreement(index, { titulo: event.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor={`acuerdo-fecha-${index}`}>Fecha compromiso</label>
                  <Input
                    id={`acuerdo-fecha-${index}`}
                    type="datetime-local"
                    value={acuerdo.fecha_compromiso}
                    onChange={(event) => updateAgreement(index, { fecha_compromiso: event.target.value })}
                  />
                </div>
              </div>

              <div className="field-grid two-columns">
                <div className="field">
                  <label htmlFor={`acuerdo-descripcion-${index}`}>Descripción</label>
                  <textarea
                    className="ui-input textarea-input"
                    id={`acuerdo-descripcion-${index}`}
                    value={acuerdo.descripcion}
                    onChange={(event) => updateAgreement(index, { descripcion: event.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`acuerdo-responsable-${index}`}>Responsable</label>
                  <select
                    className="ui-input"
                    id={`acuerdo-responsable-${index}`}
                    value={acuerdo.responsable_user_id}
                    onChange={(event) => updateAgreement(index, { responsable_user_id: event.target.value })}
                    required
                  >
                    <option value="">Seleccionar responsable</option>
                    {availableMembers.map((miembro) => (
                      <option key={miembro.user_id} value={miembro.user_id}>
                        {miembro.nombre} — {miembro.rol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {acuerdos.length > 1 ? (
                <Button onClick={() => setAcuerdos((current) => current.filter((_, currentIndex) => currentIndex !== index))} type="button">
                  Quitar acuerdo
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="form-actions">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creando acta…' : 'Crear acta'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
