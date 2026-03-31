import { Card } from '@crm/ui';

export function PageLoading({ title }: { title: string }) {
  return (
    <div className="page-loading-shell">
      <Card>
        <div className="loading-header">
          <div className="loading-spinner" />
          <div>
            <strong>{title}</strong>
            <p className="muted">Cargando datos del CRM…</p>
          </div>
        </div>
        <div className="loading-grid">
          <div className="loading-block" />
          <div className="loading-block" />
          <div className="loading-block" />
        </div>
      </Card>
    </div>
  );
}
