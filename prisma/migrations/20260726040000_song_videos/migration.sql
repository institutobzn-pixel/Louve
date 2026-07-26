-- Vídeos (YouTube) por versão de música — múltiplos, com rótulo.
CREATE TABLE "song_videos" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "song_videos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "song_videos_versionId_idx" ON "song_videos"("versionId");

ALTER TABLE "song_videos" ADD CONSTRAINT "song_videos_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "song_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migra o campo antigo (1 vídeo por versão) para a nova tabela.
INSERT INTO "song_videos" ("id", "versionId", "label", "url", "sortOrder")
SELECT gen_random_uuid()::text, "id", 'Vídeo', "youtubeUrl", 0
FROM "song_versions"
WHERE "youtubeUrl" IS NOT NULL AND "youtubeUrl" <> '';

ALTER TABLE "song_versions" DROP COLUMN "youtubeUrl";
