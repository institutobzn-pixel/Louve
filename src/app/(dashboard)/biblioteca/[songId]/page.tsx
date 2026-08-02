import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SongDeleteButton } from "@/features/library/components/song-delete-button";
import { SongInfoForm } from "@/features/library/components/song-info-form";
import { VersionManager } from "@/features/library/components/version-manager";
import { formatDuration } from "@/lib/format";
import { getCurrentOrganization } from "@/server/org";
import { getSongById } from "@/server/services/song";

export const metadata: Metadata = { title: "Música" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ songId: string }>;
}

export default async function SongPage({ params }: PageProps) {
  const { songId } = await params;
  const org = await getCurrentOrganization();
  const song = await getSongById(org.id, songId);

  if (!song) notFound();

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/biblioteca">
            <ArrowLeft /> Biblioteca Musical
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {song.name}
              </h1>
              {song.originalKey ? (
                <Badge variant="outline" className="font-mono">
                  {song.originalKey}
                </Badge>
              ) : null}
              {song.bpm ? (
                <Badge variant="outline" className="font-mono">
                  {song.bpm} bpm
                </Badge>
              ) : null}
              {song.durationSec ? (
                <Badge variant="outline" className="font-mono">
                  {formatDuration(song.durationSec)}
                </Badge>
              ) : null}
            </div>
            {song.artist ? (
              <p className="mt-1 text-muted-foreground">{song.artist}</p>
            ) : null}
          </div>

          <SongDeleteButton songId={song.id} songName={song.name} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <SongInfoForm
              songId={song.id}
              defaultValues={{
                name: song.name,
                artist: song.artist ?? "",
                composer: song.composer ?? "",
                ccli: song.ccli ?? "",
                originalKey: song.originalKey ?? "",
                bpm: song.bpm ? String(song.bpm) : "",
                duration: song.durationSec
                  ? formatDuration(song.durationSec)
                  : "",
                language: song.language ?? "",
              }}
            />
          </CardContent>
        </Card>

        <VersionManager
          songId={song.id}
          versions={song.versions.map((version) => ({
            id: version.id,
            label: version.label,
            key: version.key,
            bpm: version.bpm,
            notes: version.notes,
            chordChartUrl: version.chordChartUrl,
            chordChartText: version.chordChartText,
            videos: version.videos.map((v) => ({
              id: v.id,
              label: v.label,
              url: v.url,
            })),
            files: version.files.map((file) => ({
              id: file.id,
              kind: file.kind,
              name: file.name,
              sizeBytes: file.sizeBytes,
              mimeType: file.mimeType,
            })),
          }))}
        />
      </div>
    </>
  );
}
