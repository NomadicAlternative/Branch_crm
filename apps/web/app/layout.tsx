import './globals.css';
import type { ReactNode } from 'react';
import { ToastViewport } from '../components/layout/toast-viewport';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="app-root">
          {children}
          <ToastViewport />
        </div>
      </body>
    </html>
  );
}
