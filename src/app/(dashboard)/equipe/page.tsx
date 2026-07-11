import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Equipe" };

export default function Page() {
  return (
    <>
      <PageHeader title="Equipe" description="Músicos, instrumentos, disponibilidade e histórico." />
      <EmptyState
        icon={Users}
        title="Módulo em construção"
        description="Chega na Fase 3, junto com a Biblioteca."
      />
    </>
  );
}
