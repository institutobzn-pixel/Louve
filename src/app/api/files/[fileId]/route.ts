import { NextResponse } from "next/server";

import { getCurrentOrganization } from "@/server/org";
import * as songService from "@/server/services/song";
import {
  isSupabaseStorageConfigured,
  getFileUrl,
  readLocalFile,
  etagFor,
} from "@/server/storage";

export const runtime = "nodejs";

/**
 * Entrega de arquivo musical.
 * - Supabase configurado: redireciona para URL assinada de curta duração.
 * - Driver local (dev): streaming do disco com suporte a Range (seek de áudio).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const org = await getCurrentOrganization();
  const file = await songService.getOwnedFile(org.id, fileId);
  if (!file) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  if (isSupabaseStorageConfigured()) {
    const url = await getFileUrl(file.id, file.storagePath);
    return NextResponse.redirect(url, 302);
  }

  let data: Buffer;
  try {
    data = await readLocalFile(file.storagePath);
  } catch {
    return NextResponse.json({ error: "Arquivo ausente no disco" }, { status: 404 });
  }

  const etag = etagFor(data);
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304 });
  }

  const headers: Record<string, string> = {
    "Content-Type": file.mimeType ?? "application/octet-stream",
    "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
    "Accept-Ranges": "bytes",
    ETag: etag,
    "Cache-Control": "private, max-age=300",
  };

  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : data.length - 1;
      if (start <= end && end < data.length) {
        const chunk = data.subarray(start, end + 1);
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            ...headers,
            "Content-Range": `bytes ${start}-${end}/${data.length}`,
            "Content-Length": String(chunk.length),
          },
        });
      }
    }
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${data.length}` },
    });
  }

  return new Response(new Uint8Array(data), {
    status: 200,
    headers: { ...headers, "Content-Length": String(data.length) },
  });
}
