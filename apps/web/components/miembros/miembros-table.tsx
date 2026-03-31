import { Badge, Card, CardDescription, CardHeader, CardTitle } from '@crm/ui';
import type { Miembro } from '@crm/shared';
import Link from 'next/link';

export function MiembrosTable({ miembros }: { miembros: Miembro[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Miembros</CardTitle>
        <CardDescription>Listado inicial consumido desde la fachada MCP autenticada.</CardDescription>
      </CardHeader>

      {miembros.length === 0 ? (
        <div className="summary-item">No hay miembros visibles para el actor actual.</div>
      ) : (
        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Organización</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {miembros.map((miembro) => (
                <tr key={miembro.id}>
                  <td>
                    <strong>{miembro.nombre}</strong>
                    <span>{miembro.email}</span>
                  </td>
                  <td>{miembro.rol}</td>
                  <td>{miembro.organizacion_id}</td>
                  <td>{miembro.nivel}</td>
                  <td>
                    <Badge tone={miembro.activo ? 'success' : 'warning'}>{miembro.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td>
                    <Link href={`/miembros/${miembro.id}`}>Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
