import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Driver de armazenamento de arquivos musicais (docs/09).
 *
 * - Produção: Supabase Storage (bucket privado `song-files`, URLs assinadas).
 * - Desenvolvimento sem credenciais: disco local (.uploads/), servido por
 *   /api/files/[fileId] com suporte a range requests (seek de áudio).
 *
 * A troca é transparente: quem chama só conhece `saveSongFile`/`readLocalFile`.
 */

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), ".uploads");

export function isSupabaseStorageConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

interface SaveParams {
  organizationId: string;
  songId: string;
  versionId: string;
  filename: string;
  contentType: string;
  data: Buffer;
}

/** Salva o arquivo e retorna o storagePath a persistir em SongFile. */
export async function saveSongFile(params: SaveParams): Promise<string> {
  const safeName = params.filename.replace(/[^\w.\-]+/g, "_");
  const storagePath = `${params.organizationId}/${params.songId}/${params.versionId}/${randomUUID()}-${safeName}`;

  if (isSupabaseStorageConfigured()) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase.storage
      .from("song-files")
      .upload(storagePath, params.data, { contentType: params.contentType });
    if (error) throw error;
    return storagePath;
  }

  const fullPath = path.join(LOCAL_UPLOADS_DIR, storagePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, params.data);
  return storagePath;
}

export async function deleteSongFile(storagePath: string) {
  if (isSupabaseStorageConfigured()) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.storage.from("song-files").remove([storagePath]);
    return;
  }
  try {
    await unlink(path.join(LOCAL_UPLOADS_DIR, storagePath));
  } catch {
    // Arquivo já ausente no disco — o registro é a fonte de verdade.
  }
}

/** Lê um arquivo do driver local (usado pelo endpoint de streaming). */
export async function readLocalFile(storagePath: string) {
  return readFile(path.join(LOCAL_UPLOADS_DIR, storagePath));
}

/** URL assinada (Supabase) ou endpoint local de streaming. */
export async function getFileUrl(fileId: string, storagePath: string) {
  if (isSupabaseStorageConfigured()) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase.storage
      .from("song-files")
      .createSignedUrl(storagePath, 60 * 15);
    if (error) throw error;
    return data.signedUrl;
  }
  return `/api/files/${fileId}`;
}

/** ETag simples para cache do endpoint local. */
export function etagFor(data: Buffer) {
  return `"${createHash("sha1").update(data).digest("hex").slice(0, 16)}"`;
}
