import type { ReactNode } from 'react';
import { requireSession } from '../../lib/auth/session';
import { LogoutButton } from '../../components/layout/logout-button';
import { SidebarNav } from '../../components/layout/sidebar-nav';

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <div className="private-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <strong>CRM Rama</strong>
          <span className="nav-meta">Base operativa inicial</span>
        </div>

        <SidebarNav />

        <div className="sidebar-user">
          <div>
            <strong>{session.actor.rol}</strong>
            <span>Org: {session.actor.organizacion_id}</span>
            <span>User: {session.actor.user_id}</span>
          </div>

          <LogoutButton />
        </div>
      </aside>

      <div className="content-area">{children}</div>
    </div>
  );
}
