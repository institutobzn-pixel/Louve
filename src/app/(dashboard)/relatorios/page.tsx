import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Relatórios" };

export default function Page() {
  return (
    <>
      <PageHeader title="Relatórios" description="Músicas mais cantadas, índice de saturação e rankings." />
      <EmptyState
        icon={BarChart3}
        title="Módulo em construção"
        description="Chega na Fase 8."
      />
    </>
  );
}
