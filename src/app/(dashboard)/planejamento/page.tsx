import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { CreateServiceDialog } from "@/features/service/components/create-service-dialog";
import { PlanningView } from "@/features/service/components/planning-view";
import {
  getServiceFormOptions,
  getServicesForPlanning,
} from "@/features/service/queries";

export const metadata: Metadata = { title: "Escalas" };
export const dynamic = "force-dynamic";

export default async function PlanejamentoPage() {
  const [services, options] = await Promise.all([
    getServicesForPlanning(),
    getServiceFormOptions(),
  ]);

  const createButton = (
    <CreateServiceDialog
      typeOptions={options.types}
      memberOptions={options.members}
    />
  );

  return (
    <>
      <PageHeader
        title="Escalas"
        description="Planeje cada culto de ponta a ponta: informações, setlist, escala, ensaio e checklist."
        actions={createButton}
      />
      <PlanningView services={services} createButton={createButton} />
    </>
  );
}
