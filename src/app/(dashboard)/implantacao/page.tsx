import type { Metadata } from "next";
import { GitBranch } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Implantação de Músicas" };

export default function Page() {
  return (
    <>
      <PageHeader title="Implantação de Músicas" description="Pipeline de novas músicas: da análise até a implantação na biblioteca." />
      <EmptyState
        icon={GitBranch}
        title="Módulo em construção"
        description="Chega na Fase 7."
      />
    </>
  );
}
