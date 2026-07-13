import type { Metadata } from "next";
import type { RoleKey } from "@prisma/client";

import { PageHeader } from "@/components/shared/page-header";
import { CommunicationManager } from "@/features/communication/components/communication-manager";
import { getCurrentOrganization } from "@/server/org";
import { getAnnouncements } from "@/server/services/communication";

export const metadata: Metadata = { title: "Comunicação" };
export const dynamic = "force-dynamic";

export default async function ComunicacaoPage() {
  const org = await getCurrentOrganization();
  const announcements = await getAnnouncements(org.id);

  return (
    <>
      <PageHeader
        title="Comunicação"
        description="Avisos gerais para a equipe, segmentados por papel. Aparecem no App do Músico quando publicados."
      />
      <CommunicationManager
        announcements={announcements.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          audience: (a.audience as RoleKey[]) ?? [],
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        }))}
      />
    </>
  );
}
