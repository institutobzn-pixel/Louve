import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { MyServiceCard } from "@/features/musician/components/my-service-card";
import { toMyServiceCardData } from "@/features/musician/mappers";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { getMyServices } from "@/server/services/musician";

export const metadata: Metadata = { title: "Minha Agenda" };
export const dynamic = "force-dynamic";

export default async function MinhaAgendaPage() {
  const org = await getCurrentOrganization();
  const member = await getCurrentMember();

  if (!member) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhum músico ativo"
        description="Cadastre músicos no módulo Equipe da gestão."
      />
    );
  }

  const assignments = await getMyServices(org.id, member.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = assignments.filter(
    (assignment) => new Date(assignment.service.date) >= today
  );

  const pending = upcoming.filter((a) => a.status === "CONVIDADO").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {member.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {upcoming.length === 0
            ? "Você não tem cultos agendados."
            : pending > 0
              ? `Você tem ${pending} convite${pending === 1 ? "" : "s"} aguardando resposta.`
              : "Tudo confirmado por aqui."}
        </p>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Agenda livre"
          description="Quando você for escalado para um culto, ele aparece aqui."
        />
      ) : (
        <div className="space-y-3">
          {upcoming.map((assignment) => (
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
