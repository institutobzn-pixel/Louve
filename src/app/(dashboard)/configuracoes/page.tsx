import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Configurações" };

export default function Page() {
  return (
    <>
      <PageHeader title="Configurações" description="Organização, campi, papéis e tipos de culto." />
      <EmptyState
        icon={Settings}
        title="Módulo em construção"
        description="Administração do tenant — evolui ao longo das fases."
      />
    </>
  );
}
