'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/miembros', label: 'Miembros' },
  { href: '/tareas', label: 'Tareas' },
  { href: '/consejo', label: 'Consejo' },
  { href: '/reportes', label: 'Reportes' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal">
      {LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link key={link.href} className={`sidebar-link${isActive ? ' is-active' : ''}`} href={link.href}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
