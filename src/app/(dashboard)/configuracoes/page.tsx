import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { InstrumentSettings } from "@/features/settings/components/instrument-settings";
import { getInstrumentCatalog } from "@/features/settings/queries";

export const metadata: Metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const catalog = await getInstrumentCatalog();

  return (
    <>
      <PageHeader
        title="Instrumentos e funções"
        description="Escolha quais instrumentos e funções o seu ministério usa. Os que ficarem desligados não aparecem na escala nem no perfil dos músicos."
      />
      <InstrumentSettings catalog={catalog} />
    </>
  );
}
