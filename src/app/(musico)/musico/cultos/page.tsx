import type { Metadata } from "next";
import { ListMusic } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { MyServiceCard } from "@/features/musician/components/my-service-card";
import { toMyServiceCardData } from "@/features/musician/mappers";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { getMyServices } from "@/server/services/musician";

export const metadata: Metadata = { title: "Meus Cultos" };
export const dynamic = "force-dynamic";

export default async function MeusCultosPage() {
  const org = await getCurrentOrganization();
  const member = await getCurrentMember();

  if (!member) return null;

  const assignments = await getMyServices(org.id, member.id);

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Meus Cultos
      </h1>

      {assignments.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Nenhum culto por aqui"
          description="Cultos em que você foi escalado (incluindo os últimos 30 dias) aparecem nesta lista."
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <MyServiceCard
              key={assignment.id}
              data={toMyServiceCardData(assignment, member.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
