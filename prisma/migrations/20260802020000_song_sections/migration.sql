-- Trechos do arranjo (Intro, Verso, Refrão…) por versão de música.
CREATE TABLE "song_sections" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "measures" INTEGER,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "song_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "song_sections_versionId_idx" ON "song_sections"("versionId");

ALTER TABLE "song_sections" ADD CONSTRAINT "song_sections_versionId_fkey"
  FOREIGN KEY ("versionId") REFERENCES "song_versions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Isolamento por igreja (mesmo padrão de song_files e song_videos).
ALTER TABLE "song_sections" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child ON "song_sections";
CREATE POLICY tenant_child ON "song_sections" FOR ALL USING (EXISTS (
  SELECT 1 FROM "song_versions" v JOIN "songs" s ON s.id = v."songId"
  WHERE v.id = "song_sections"."versionId"
  AND s."organizationId" = (auth.jwt() ->> 'organization_id')));
