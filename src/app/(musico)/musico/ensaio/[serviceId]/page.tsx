import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Music4,
} from "lucide-react";

import { AudioPlayer } from "@/components/shared/audio-player";
import { ChordChart } from "@/components/shared/chord-chart";
import { Metronome } from "@/components/shared/metronome";
import { MultitrackMixer } from "@/components/shared/multitrack-mixer";
import { VideoGallery } from "@/components/shared/video-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/lib/format";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { getRehearsalContent } from "@/server/services/musician";
import type { FileKind, SongFile } from "@prisma/client";

export const metadata: Metadata = { title: "Modo Ensaio" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

/**
 * Modo Ensaio Inteligente (docs/06): cada músico vê SOMENTE o conteúdo
 * da sua função —
 * · Vocal: letra, guia vocal, playback, tom, harmonias
 * · Baterista: clique, estrutura, playback
 * · Instrumentista: partitura, playback, multitrack, clique, loop, observações
 */
export default async function ModoEnsaioPage({ params }: PageProps) {
  const { serviceId } = await params;
  const org = await getCurrentOrganization();
  const member = await getCurrentMember();
  if (!member) notFound();

  const content = await getRehearsalContent(org.id, member.id, serviceId);
  if (!content) notFound();

  const { assignment, items } = content;
  const isVocal =
    assignment.instrument.isVocal ||
    assignment.instrument.category.key === "VOZ" ||
    assignment.instrument.category.key === "LIDERANCA";
  const isDrummer = assignment.instrument.name === "Bateria";

  // Trilhas MULTITRACK de áudio vão para o mixer; os demais áudios
  // (playback, guia, clique) ficam em players individuais.
  const audioKinds: FileKind[] = isVocal
    ? ["GUIA_VOCAL", "PLAYBACK"]
    : isDrummer
      ? ["CLIQUE", "PLAYBACK"]
      : ["PLAYBACK", "CLIQUE"];
  const docKinds: FileKind[] = isVocal
    ? ["LETRA", "CIFRA"]
    : isDrummer
      ? []
      : ["PARTITURA", "CIFRA"];

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href={`/musico/cultos/${serviceId}`}>
          <ArrowLeft /> Voltar ao culto
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Music4 className="h-6 w-6 text-primary" /> Modo Ensaio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conteúdo da sua função:{" "}
          <span className="font-medium text-primary">
            {assignment.instrument.name}
          </span>{" "}
          · {assignment.service.type?.name ?? "Culto"}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          O setlist deste culto ainda não foi montado.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map(({ item, files }, index) => {
            const multitrackFiles = files.filter(
              (file) =>
                file.kind === "MULTITRACK" &&
                file.mimeType?.startsWith("audio/")
            );
            const audioFiles = files.filter(
              (file) =>
                audioKinds.includes(file.kind) &&
                file.mimeType?.startsWith("audio/")
            );
            const docFiles = files.filter(
              (file) =>
                docKinds.includes(file.kind) &&
                !file.mimeType?.startsWith("audio/")
            );
            // O andamento do arranjo manda; a música é o último recurso.
            const bpm = item.bpmOverride ?? item.version?.bpm ?? item.song.bpm;

            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">
                      {index + 1}
                    </span>
                    <CardTitle className="text-base">
                      {item.song.name}
                    </CardTitle>
                    {item.keyOverride ? (
                      <Badge className="font-mono">{item.keyOverride}</Badge>
                    ) : null}
                    {item.bpmOverride ? (
                      <Badge variant="outline" className="font-mono">
                        {item.bpmOverride} bpm
                      </Badge>
                    ) : null}
                    {item.durationSec ? (
                      <Badge variant="outline" className="font-mono">
                        {formatDuration(item.durationSec)}
                      </Badge>
                    ) : null}
                  </div>
                  {item.song.artist ? (
                    <p className="text-xs text-muted-foreground">
                      {item.song.artist}
                      {item.version ? ` · versão ${item.version.label}` : null}
                    </p>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-3">
                  {isDrummer && item.notes ? (
                    <div className="rounded-xl border bg-muted/40 p-3 text-sm">
                      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                        Estrutura
                      </p>
                      {item.notes}
                    </div>
                  ) : item.notes ? (
                    <div className="rounded-xl border bg-muted/40 p-3 text-sm">
                      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                        Observações
                      </p>
                      {item.notes}
                    </div>
                  ) : null}

                  {bpm ? <Metronome bpm={bpm} /> : null}

                  {!isDrummer && item.version?.chordChartText ? (
                    <ChordChart
                      text={item.version.chordChartText}
                      originalKey={item.keyOverride ?? item.version.key}
                    />
                  ) : null}

                  {item.version && item.version.videos.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Vídeos de referência
                      </p>
                      <VideoGallery videos={item.version.videos} />
                    </div>
                  ) : null}

                  {multitrackFiles.length > 0 ? (
                    <MultitrackMixer
                      tracks={multitrackFiles.map((file) => ({
                        id: file.id,
                        name: stemName(file.name),
                        src: `/api/files/${file.id}`,
                      }))}
                    />
                  ) : null}

                  {audioFiles.map((file) => (
                    <div key={file.id} className="space-y-1">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        {kindLabel(file)}
                      </p>
                      <AudioPlayer src={`/api/files/${file.id}`} allowLoop />
                    </div>
                  ))}

                  {docFiles.length > 0 || (!isDrummer && item.version?.chordChartUrl) ? (
                    <div className="flex flex-wrap gap-2">
                      {!isDrummer && item.version?.chordChartUrl ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={item.version.chordChartUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink /> Ver cifra
                          </a>
                        </Button>
                      ) : null}
                      {docFiles.map((file) => (
                        <Button
                          key={file.id}
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`/api/files/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file.kind === "MULTITRACK" ? (
                              <Layers />
                            ) : (
                              <FileText />
                            )}
                            {kindLabel(file)}
                            <Download className="opacity-60" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  ) : null}

                  {multitrackFiles.length === 0 &&
                  audioFiles.length === 0 &&
                  docFiles.length === 0 &&
                  !bpm &&
                  !(
                    !isDrummer &&
                    (item.version?.chordChartUrl || item.version?.chordChartText)
                  ) ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum material da sua função foi enviado para esta
                      música ainda.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

/** Nome amigável da trilha a partir do arquivo (ex.: "baixo.mp3" → "Baixo"). */
function stemName(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function kindLabel(file: SongFile) {
  const labels: Record<FileKind, string> = {
    PLAYBACK: "Playback",
    PARTITURA: "Partitura",
    MULTITRACK: "Multitrack",
    GUIA_VOCAL: "Guia Vocal",
    CIFRA: "Cifra",
    LETRA: "Letra",
    CLIQUE: "Clique",
    OUTRO: "Arquivo",
  };
  return labels[file.kind];
}
