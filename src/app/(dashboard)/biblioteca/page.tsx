import type { Metadata } from "next";
import { Library } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Biblioteca Musical" };

export default function Page() {
  return (
    <>
      <PageHeader title="Biblioteca Musical" description="Repertório oficial do ministério, com versões, tons, BPM e arquivos." />
      <EmptyState
        icon={Library}
        title="Módulo em construção"
        description="Chega na Fase 3, junto com o módulo de Equipe."
      />
    </>
  );
}
