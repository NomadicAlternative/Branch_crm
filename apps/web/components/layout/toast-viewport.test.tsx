import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastViewport } from './toast-viewport';
import { getToastEventName, setFlashToast } from '../../lib/ui/toast';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('ToastViewport', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders flash toast from session storage', async () => {
    setFlashToast({ message: 'Miembro creado correctamente.', tone: 'success' });

    render(<ToastViewport />);

    expect(await screen.findByText('Miembro creado correctamente.')).toBeInTheDocument();
  });

  it('renders toast emitted through browser event', async () => {
    render(<ToastViewport />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent(getToastEventName(), {
          detail: { message: 'Tarea asignada correctamente.', tone: 'success' },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Tarea asignada correctamente.')).toBeInTheDocument();
    });
  });
});
