-- Extensão vocal confortável do músico (número MIDI; 60 = Dó central).
ALTER TABLE "members" ADD COLUMN "vocalLowNote" INTEGER;
ALTER TABLE "members" ADD COLUMN "vocalHighNote" INTEGER;

-- Extensão da melodia da versão, no tom em que ela foi cadastrada.
ALTER TABLE "song_versions" ADD COLUMN "melodyLowNote" INTEGER;
ALTER TABLE "song_versions" ADD COLUMN "melodyHighNote" INTEGER;
