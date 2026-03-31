import type { OrganizacionJerarquica, UsuarioJerarquico } from '@crm/shared/jerarquia';

export const ORGANIZACIONES: OrganizacionJerarquica[] = [
  { id: 'rama-sud', nombre: 'Rama Sud', parent_id: null, nivel: 100 },
  { id: 'org-jovenes', nombre: 'Jóvenes', parent_id: 'rama-sud', nivel: 80 },
  { id: 'org-sociedad-socorro', nombre: 'Sociedad de Socorro', parent_id: 'rama-sud', nivel: 80 },
  { id: 'org-primaria', nombre: 'Primaria', parent_id: 'rama-sud', nivel: 80 },
  { id: 'clase-valientes', nombre: 'Clase Valientes', parent_id: 'org-primaria', nivel: 70 },
];

export const USUARIOS_JERARQUIA: UsuarioJerarquico[] = [
  {
    user_id: 'u-rama-presidente',
    nombre: 'Presidente Rama',
    rol: 'presidente_rama',
    organizacion_id: 'rama-sud',
    nivel: 100,
  },
  {
    user_id: 'u-consejero-rama',
    nombre: 'Consejero Rama',
    rol: 'consejero_rama',
    organizacion_id: 'rama-sud',
    nivel: 90,
  },
  {
    user_id: 'u-presidente-jovenes',
    nombre: 'Presidenta Jóvenes',
    rol: 'presidente_organizacion',
    organizacion_id: 'org-jovenes',
    nivel: 80,
  },
  {
    user_id: 'u-consejero-jovenes',
    nombre: 'Consejero Jóvenes',
    rol: 'consejero_organizacion',
    organizacion_id: 'org-jovenes',
    nivel: 70,
  },
  {
    user_id: 'u-miembro-jovenes',
    nombre: 'Miembro Jóvenes',
    rol: 'miembro',
    organizacion_id: 'org-jovenes',
    nivel: 10,
  },
  {
    user_id: 'u-lider-primaria',
    nombre: 'Líder Primaria',
    rol: 'presidente_organizacion',
    organizacion_id: 'org-primaria',
    nivel: 80,
  },
  {
    user_id: 'u-maestra-valientes',
    nombre: 'Maestra Valientes',
    rol: 'consejero_organizacion',
    organizacion_id: 'clase-valientes',
    nivel: 70,
  },
  {
    user_id: 'u-nino-valientes',
    nombre: 'Niño Valientes',
    rol: 'miembro',
    organizacion_id: 'clase-valientes',
    nivel: 10,
  },
];

export const ROLE_LEVELS: Record<string, number> = {
  presidente_rama: 100,
  consejero_rama: 90,
  presidente_organizacion: 80,
  consejero_organizacion: 70,
  miembro: 10,
};
