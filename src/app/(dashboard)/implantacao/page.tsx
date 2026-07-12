import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import {
  ImplementationBoard,
  type BoardCard,
} from "@/features/implementation/components/implementation-board";
import { NewImplementationDialog } from "@/features/implementation/components/new-implementation-dialog";
import { getCurrentOrganization } from "@/server/org";
import { getBoard } from "@/server/services/implementation";

export const metadata: Metadata = { title: "Implantação de Músicas" };
export const dynamic = "force-dynamic";

export default async function ImplantacaoPage() {
  const org = await getCurrentOrganization();
  const items = await getBoard(org.id);

  const cards: BoardCard[] = items.map((item) => ({
    id: item.id,
    stage: item.stage,
    songName: item.song.name,
    artist: item.song.artist,
    originalKey: item.song.originalKey,
    versionCount: item.song._count.versions,
  }));

  return (
    <>
      <PageHeader
        title="Implantação de Músicas"
        description="Pipeline de novas músicas: da análise até a implantação na Biblioteca. Arraste os cards entre as etapas."
        actions={<NewImplementationDialog />}
      />
      <ImplementationBoard cards={cards} />
    </>
  );
}
