'use client';

import { Button } from '@crm/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch('/api/session/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button className="sidebar-logout" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? 'Saliendo…' : 'Cerrar sesión'}
    </Button>
  );
}
