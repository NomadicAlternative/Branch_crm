'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { consumeFlashToast, getToastEventName, type ToastPayload } from '../../lib/ui/toast';

interface ToastItem extends ToastPayload {
  id: number;
}

export function ToastViewport() {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const enqueueToast = useCallback((payload: ToastPayload) => {
    const nextToast: ToastItem = {
      ...payload,
      id: Date.now() + Math.floor(Math.random() * 1000),
    };

    setToasts((current) => [...current, nextToast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== nextToast.id));
    }, 4000);
  }, []);

  useEffect(() => {
    const flashToast = consumeFlashToast();
    if (flashToast) {
      enqueueToast(flashToast);
    }
  }, [enqueueToast, pathname]);

  useEffect(() => {
    const eventName = getToastEventName();
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>;
      if (customEvent.detail) {
        enqueueToast(customEvent.detail);
      }
    };

    window.addEventListener(eventName, handler as EventListener);
    return () => window.removeEventListener(eventName, handler as EventListener);
  }, [enqueueToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div aria-live="polite" className="toast-viewport">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.tone}`} key={toast.id} role="status">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
