import { NextResponse } from "next/server";

import { fileKinds, MAX_FILE_SIZE_MB } from "@/features/library/schema";
import { getCurrentOrganization } from "@/server/org";
import { prisma } from "@/server/db";
import * as songService from "@/server/services/song";
import { saveSongFile } from "@/server/storage";

export const runtime = "nodejs";

/**
 * Upload de arquivo musical (multipart/form-data: file, versionId, kind).
 * Grava no driver de storage (Supabase ou disco local em dev) e registra
 * o metadado em song_files.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const versionId = formData.get("versionId");
    const kind = formData.get("kind");

    if (!(file instanceof File) || typeof versionId !== "string") {
      return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
    }
    if (
      typeof kind !== "string" ||
      !fileKinds.includes(kind as (typeof fileKinds)[number])
    ) {
      return NextResponse.json({ error: "Tipo de arquivo inválido" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Arquivo acima de ${MAX_FILE_SIZE_MB} MB` },
        { status: 413 }
      );
    }

    const org = await getCurrentOrganization();
    const version = await prisma.songVersion.findFirst({
      where: { id: versionId, song: { organizationId: org.id } },
    });
    if (!version) {
      return NextResponse.json({ error: "Versão não encontrada" }, { status: 404 });
    }

    const data = Buffer.from(await file.arrayBuffer());
    const storagePath = await saveSongFile({
      organizationId: org.id,
      songId: version.songId,
      versionId: version.id,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      data,
    });

    const songFile = await songService.attachSongFile(org.id, version.id, {
      kind: kind as (typeof fileKinds)[number],
      storagePath,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
    });

    return NextResponse.json({ ok: true, fileId: songFile.id });
  } catch (e) {
    console.error("upload", e);
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
  }
}
