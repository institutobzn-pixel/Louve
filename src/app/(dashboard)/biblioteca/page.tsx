import type { Metadata } from "next";
import Link from "next/link";
import { Disc3, FileAudio, Library, Music2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchForm } from "@/components/shared/search-form";
import { CreateSongDialog } from "@/features/library/components/create-song-dialog";
import { getCurrentOrganization } from "@/server/org";
import { getSongs } from "@/server/services/song";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = { title: "Biblioteca Musical" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BibliotecaPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const org = await getCurrentOrganization();
  const songs = await getSongs(org.id, q);

  return (
    <>
      <PageHeader
        title="Biblioteca Musical"
        description="Repertório oficial do ministério, com versões, tons, BPM e arquivos."
        actions={<CreateSongDialog />}
      />

      <div className="mb-6">
        <SearchForm
          action="/biblioteca"
          placeholder="Buscar por nome ou artista…"
          defaultValue={q}
        />
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={Library}
          title={q ? "Nenhuma música encontrada" : "Biblioteca vazia"}
          description={
            q
              ? "Tente outro termo de busca."
              : 'Comece pelo botão "Nova música" — versões e arquivos são adicionados na página da música.'
          }
          action={q ? undefined : <CreateSongDialog />}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {songs.map((song) => {
            const fileCount = song.versions.reduce(
              (sum, v) => sum + v._count.files,
              0
            );
            return (
              <Link key={song.id} href={`/biblioteca/${song.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 animate-fade-in-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <Music2 className="h-5 w-5 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{song.name}</p>
                    {song.artist ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {song.artist}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {song.originalKey ? (
                      <Badge variant="outline" className="font-mono">
                        {song.originalKey}
                      </Badge>
                    ) : null}
                    {song.durationSec ? (
                      <Badge variant="outline" className="font-mono">
                        {formatDuration(song.durationSec)}
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="gap-1">
                      <Disc3 className="h-3 w-3" /> {song.versions.length}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <FileAudio className="h-3 w-3" /> {fileCount}
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
