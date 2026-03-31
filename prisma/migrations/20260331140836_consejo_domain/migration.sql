-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('pendiente', 'en_progreso', 'completado');

-- CreateTable
CREATE TABLE "CouncilMinute" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilMinute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilAgreement" (
    "id" TEXT NOT NULL,
    "minuteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "responsibleMemberId" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'pendiente',
    "followUpComment" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouncilMinute_organizationId_idx" ON "CouncilMinute"("organizationId");

-- CreateIndex
CREATE INDEX "CouncilAgreement_minuteId_idx" ON "CouncilAgreement"("minuteId");

-- CreateIndex
CREATE INDEX "CouncilAgreement_responsibleMemberId_idx" ON "CouncilAgreement"("responsibleMemberId");

-- CreateIndex
CREATE INDEX "CouncilAgreement_status_idx" ON "CouncilAgreement"("status");

-- AddForeignKey
ALTER TABLE "CouncilMinute" ADD CONSTRAINT "CouncilMinute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMinute" ADD CONSTRAINT "CouncilMinute_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilAgreement" ADD CONSTRAINT "CouncilAgreement_minuteId_fkey" FOREIGN KEY ("minuteId") REFERENCES "CouncilMinute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilAgreement" ADD CONSTRAINT "CouncilAgreement_responsibleMemberId_fkey" FOREIGN KEY ("responsibleMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
