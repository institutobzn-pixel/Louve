-- Novo modelo de escala (sem convite):
-- o músico é ESCALADO e recebe notificação no app (seenAt).

-- 1. Novo enum com os dois estados restantes
CREATE TYPE "AssignmentStatus_new" AS ENUM ('ESCALADO', 'SUBSTITUIDO');

-- 2. Migra os dados: qualquer estado do fluxo de convite vira ESCALADO
ALTER TABLE "assignments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "assignments"
  ALTER COLUMN "status" TYPE "AssignmentStatus_new"
  USING (
    CASE WHEN "status"::text = 'SUBSTITUIDO' THEN 'SUBSTITUIDO' ELSE 'ESCALADO' END
  )::"AssignmentStatus_new";

-- 3. Troca o tipo
DROP TYPE "AssignmentStatus";
ALTER TYPE "AssignmentStatus_new" RENAME TO "AssignmentStatus";
ALTER TABLE "assignments" ALTER COLUMN "status" SET DEFAULT 'ESCALADO';

-- 4. respondedAt sai; seenAt entra (notificação de nova escala)
ALTER TABLE "assignments" DROP COLUMN "respondedAt";
ALTER TABLE "assignments" ADD COLUMN "seenAt" TIMESTAMP(3);
