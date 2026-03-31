import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const organizations = [
  { id: 'rama-sud', code: 'rama-sud', name: 'Rama Sud', level: 100, parentId: null },
  { id: 'org-jovenes', code: 'org-jovenes', name: 'Jóvenes', level: 80, parentId: 'rama-sud' },
  {
    id: 'org-sociedad-socorro',
    code: 'org-sociedad-socorro',
    name: 'Sociedad de Socorro',
    level: 80,
    parentId: 'rama-sud',
  },
  { id: 'org-primaria', code: 'org-primaria', name: 'Primaria', level: 80, parentId: 'rama-sud' },
  {
    id: 'clase-valientes',
    code: 'clase-valientes',
    name: 'Clase Valientes',
    level: 70,
    parentId: 'org-primaria',
  },
];

const users = [
  {
    id: 'u-rama-presidente',
    email: 'presidente.rama@crm.local',
    displayName: 'Presidente Rama',
    role: 'presidente_rama',
    level: 100,
    organizationId: 'rama-sud',
    memberId: 'm-rama-presidente',
  },
  {
    id: 'u-consejero-rama',
    email: 'consejero.rama@crm.local',
    displayName: 'Consejero Rama',
    role: 'consejero_rama',
    level: 90,
    organizationId: 'rama-sud',
    memberId: 'm-consejero-rama',
  },
  {
    id: 'u-presidente-jovenes',
    email: 'jovenes.presidencia@crm.local',
    displayName: 'Presidenta Jóvenes',
    role: 'presidente_organizacion',
    level: 80,
    organizationId: 'org-jovenes',
    memberId: 'm-presidente-jovenes',
  },
  {
    id: 'u-consejero-jovenes',
    email: 'consejero.jovenes@crm.local',
    displayName: 'Consejero Jóvenes',
    role: 'consejero_organizacion',
    level: 70,
    organizationId: 'org-jovenes',
    memberId: 'm-consejero-jovenes',
  },
  {
    id: 'u-miembro-jovenes',
    email: 'miembro.jovenes@crm.local',
    displayName: 'Miembro Jóvenes',
    role: 'miembro',
    level: 10,
    organizationId: 'org-jovenes',
    memberId: 'm-miembro-jovenes',
  },
  {
    id: 'u-lider-primaria',
    email: 'lider.primaria@crm.local',
    displayName: 'Líder Primaria',
    role: 'presidente_organizacion',
    level: 80,
    organizationId: 'org-primaria',
    memberId: 'm-lider-primaria',
  },
  {
    id: 'u-maestra-valientes',
    email: 'maestra.valientes@crm.local',
    displayName: 'Maestra Valientes',
    role: 'consejero_organizacion',
    level: 70,
    organizationId: 'clase-valientes',
    memberId: 'm-maestra-valientes',
  },
  {
    id: 'u-nino-valientes',
    email: 'nino.valientes@crm.local',
    displayName: 'Niño Valientes',
    role: 'miembro',
    level: 10,
    organizationId: 'clase-valientes',
    memberId: 'm-nino-valientes',
  },
];

const tasks = [
  {
    id: 't-1',
    title: 'Revisar metas de jóvenes',
    description: 'Preparar informe semanal de seguimiento.',
    organizationId: 'org-jovenes',
    createdByMemberId: 'm-presidente-jovenes',
    assignedToMemberId: 'm-consejero-jovenes',
    status: 'asignada',
  },
  {
    id: 't-2',
    title: 'Actualizar lista de asistencia',
    description: 'Confirmar niños activos de Valientes.',
    organizationId: 'clase-valientes',
    createdByMemberId: 'm-lider-primaria',
    assignedToMemberId: 'm-maestra-valientes',
    status: 'asignada',
  },
];

const councilMinutes = [
  {
    id: 'cm-1',
    title: 'Consejo de coordinación semanal',
    summary: 'Revisión de metas, asistencia y seguimiento de acuerdos abiertos.',
    meetingDate: new Date('2026-03-30T19:00:00.000Z'),
    organizationId: 'org-jovenes',
    createdByMemberId: 'm-presidente-jovenes',
  },
];

const councilAgreements = [
  {
    id: 'ca-1',
    minuteId: 'cm-1',
    title: 'Contactar a los jóvenes ausentes',
    description: 'Llamar durante la semana a quienes faltaron dos domingos seguidos.',
    responsibleMemberId: 'm-consejero-jovenes',
    status: 'en_progreso',
    followUpComment: 'Ya se contactó a una familia, faltan dos más.',
    dueDate: new Date('2026-04-04T18:00:00.000Z'),
  },
  {
    id: 'ca-2',
    minuteId: 'cm-1',
    title: 'Preparar actividad de servicio',
    description: 'Definir responsables y materiales para la actividad del sábado.',
    responsibleMemberId: 'm-miembro-jovenes',
    status: 'pendiente',
    followUpComment: null,
    dueDate: new Date('2026-04-05T16:00:00.000Z'),
  },
];

async function main() {
  for (const organization of organizations) {
    await prisma.organization.upsert({
      where: { id: organization.id },
      update: organization,
      create: organization,
    });
  }

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        displayName: user.displayName,
        passwordHash: bcrypt.hashSync('changeme123', 10),
        role: user.role,
        level: user.level,
      },
      create: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        passwordHash: bcrypt.hashSync('changeme123', 10),
        role: user.role,
        level: user.level,
      },
    });

    await prisma.member.upsert({
      where: { userId: user.id },
      update: {
        organizationId: user.organizationId,
        active: true,
      },
      create: {
        id: user.memberId,
        userId: user.id,
        organizationId: user.organizationId,
        active: true,
      },
    });
  }

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        organizationId: task.organizationId,
        createdByMemberId: task.createdByMemberId,
        assignedToMemberId: task.assignedToMemberId,
        status: task.status,
      },
      create: task,
    });
  }

  for (const minute of councilMinutes) {
    await prisma.councilMinute.upsert({
      where: { id: minute.id },
      update: minute,
      create: minute,
    });
  }

  for (const agreement of councilAgreements) {
    await prisma.councilAgreement.upsert({
      where: { id: agreement.id },
      update: agreement,
      create: agreement,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
