-- A igreja escolhe quais instrumentos/funções usa (ativar/desativar).
ALTER TABLE "instruments" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
