import type { Metadata } from "next";
import { Megaphone } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Comunicação" };

export default function Page() {
  return (
    <>
      <PageHeader title="Comunicação" description="Avisos e mensagens para a equipe." />
      <EmptyState
        icon={Megaphone}
        title="Módulo em construção"
        description="Chega na Fase 9."
      />
    </>
  );
}
