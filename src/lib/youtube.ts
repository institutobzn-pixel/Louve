/**
 * Utilidades para links do YouTube: extrai o ID do vídeo de várias formas de
 * URL (watch, youtu.be, shorts, embed, live) e monta miniatura e link de
 * visualização. Usado na Biblioteca Musical para as versões de cada música.
 */

/** Extrai o ID do vídeo de uma URL do YouTube, ou null se não reconhecer. */
export function youtubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const match = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

/** Miniatura (thumbnail) do vídeo a partir do ID. */
export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** Link canônico para assistir ao vídeo. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** URL de incorporação (player embutido no app, sem cookies de rastreio). */
export function youtubeEmbedUrl(id: string, autoplay = true): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
