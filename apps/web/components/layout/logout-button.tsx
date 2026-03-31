'use client';

import { Button } from '@crm/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setFlashToast } from '../../lib/ui/toast';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch('/api/session/logout', { method: 'POST' });
    setFlashToast({ message: 'Sesión cerrada.', tone: 'info' });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button className="sidebar-logout" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? 'Saliendo…' : 'Cerrar sesión'}
    </Button>
  );
}
