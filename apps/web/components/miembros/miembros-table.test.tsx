import React, { type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MiembrosTable } from './miembros-table';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('MiembrosTable', () => {
  it('shows member information and status badges', () => {
    render(
      <MiembrosTable
        miembros={[
          {
            id: 'm-1',
            user_id: 'u-1',
            nombre: 'Presidente Rama',
            email: 'presidente@crm.local',
            telefono: '123',
            rol: 'presidente_rama',
            organizacion_id: 'rama-sud',
            nivel: 100,
            activo: true,
          },
        ]}
      />,
    );

    expect(screen.getByText('Presidente Rama')).toBeInTheDocument();
    expect(screen.getByText('presidente@crm.local')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/miembros/m-1');
  });
});
