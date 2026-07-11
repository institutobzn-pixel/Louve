import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Planejamento" };

export default function Page() {
  return (
    <>
      <PageHeader title="Planejamento" description="Planeje cada culto de ponta a ponta: informações, setlist, escala, ensaio e checklist." />
      <EmptyState
        icon={CalendarRange}
        title="Módulo em construção"
        description="Chega na Fase 1 — é o coração do sistema."
      />
    </>
  );
}
