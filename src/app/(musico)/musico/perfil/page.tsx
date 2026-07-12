import type { Metadata } from "next";
import { Star, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AvailabilityEditor } from "@/features/team/components/availability-editor";
import { skillLevelLabels } from "@/features/team/schema";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { getMemberById } from "@/server/services/member";

export const metadata: Metadata = { title: "Perfil" };
export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function PerfilPage() {
  const org = await getCurrentOrganization();
  const current = await getCurrentMember();

  if (!current) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nenhum músico ativo"
        description="Cadastre músicos no módulo Equipe da gestão."
      />
    );
  }

  const member = await getMemberById(org.id, current.id);
  if (!member) return null;

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
            {initials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {member.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {skillLevelLabels[member.level]}
            {member.email ? ` · ${member.email}` : null}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Meus instrumentos</CardTitle>
          </CardHeader>
          <CardContent>
            {member.instruments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum instrumento definido — fale com a liderança.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {member.instruments.map((mi) => (
                  <Badge
                    key={mi.instrumentId}
                    variant={mi.isPrimary ? "default" : "secondary"}
                    className="gap-1 py-1"
                  >
                    {mi.isPrimary ? <Star className="h-3 w-3" /> : null}
                    {mi.instrument.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Minha disponibilidade</CardTitle>
            <CardDescription>
              Registre quando você NÃO pode servir — a liderança vê isso ao
              montar a escala.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityEditor
              memberId={member.id}
              entries={member.availability.map((entry) => ({
                id: entry.id,
                date: entry.date ? entry.date.toISOString() : null,
                weekday: entry.weekday,
                reason: entry.reason,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
