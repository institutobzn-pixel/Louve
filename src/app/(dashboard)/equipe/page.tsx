import type { Metadata } from "next";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchForm } from "@/components/shared/search-form";
import { CreateMemberDialog } from "@/features/team/components/create-member-dialog";
import { MemberCard } from "@/features/team/components/member-card";
import { getTeamMembers } from "@/features/team/queries";

export const metadata: Metadata = { title: "Equipe" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function EquipePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const members = await getTeamMembers(q);

  return (
    <>
      <PageHeader
        title="Equipe"
        description="Músicos e equipe técnica: instrumentos, disponibilidade e histórico."
        actions={<CreateMemberDialog />}
      />

      <div className="mb-6">
        <SearchForm
          action="/equipe"
          placeholder="Buscar por nome…"
          defaultValue={q}
        />
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "Nenhum músico encontrado" : "Nenhum músico cadastrado"}
          description={
            q
              ? "Tente outro termo de busca."
              : 'Comece pelo botão "Novo músico" — instrumentos e disponibilidade são definidos no perfil.'
          }
          action={q ? undefined : <CreateMemberDialog />}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </>
  );
}
