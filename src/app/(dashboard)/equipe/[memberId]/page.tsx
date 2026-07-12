import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cake, History, Mail, Phone } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvailabilityEditor } from "@/features/team/components/availability-editor";
import { InstrumentsEditor } from "@/features/team/components/instruments-editor";
import { MemberActiveToggle } from "@/features/team/components/member-active-toggle";
import { MemberInfoForm } from "@/features/team/components/member-info-form";
import {
  getInstrumentOptions,
  getMemberProfile,
} from "@/features/team/queries";
import { skillLevelLabels } from "@/features/team/schema";
import { ServiceStatusPill } from "@/features/service/components/service-status-pill";
import { formatDateShort, toDateInputValue } from "@/lib/format";

export const metadata: Metadata = { title: "Músico" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ memberId: string }>;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function MemberPage({ params }: PageProps) {
  const { memberId } = await params;

  const [member, instrumentOptions] = await Promise.all([
    getMemberProfile(memberId),
    getInstrumentOptions(),
  ]);

  if (!member) notFound();

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/equipe">
            <ArrowLeft /> Equipe
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                {initials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {member.name}
                </h1>
                <Badge variant="secondary">
                  {skillLevelLabels[member.level]}
                </Badge>
                {!member.isActive ? (
                  <Badge variant="danger">Inativo</Badge>
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {member.email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {member.email}
                  </span>
                ) : null}
                {member.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {member.phone}
                  </span>
                ) : null}
                {member.birthday ? (
                  <span className="inline-flex items-center gap-1">
                    <Cake className="h-3.5 w-3.5" />
                    {formatDateShort(new Date(member.birthday))}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <MemberActiveToggle memberId={member.id} isActive={member.isActive} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberInfoForm
              memberId={member.id}
              defaultValues={{
                name: member.name,
                email: member.email ?? "",
                phone: member.phone ?? "",
                birthday: member.birthday
                  ? toDateInputValue(new Date(member.birthday))
                  : "",
                level: member.level,
                notes: member.notes ?? "",
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instrumentos e funções</CardTitle>
              <CardDescription>
                Principais (★) têm prioridade nas sugestões de escala.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstrumentsEditor
                memberId={member.id}
                options={instrumentOptions}
                current={member.instruments.map((mi) => ({
                  instrumentId: mi.instrumentId,
                  instrumentName: mi.instrument.name,
                  categoryLabel: mi.instrument.category.label,
                  isPrimary: mi.isPrimary,
                  level: mi.level,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade</CardTitle>
              <CardDescription>
                Registre quando o músico NÃO pode servir.
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" /> Histórico de escalas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member.assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem participações registradas — o histórico é preenchido
                  conforme o músico for escalado (Fase 4).
                </p>
              ) : (
                <ul className="space-y-2">
                  {member.assignments.map((assignment) => (
                    <li
                      key={assignment.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm"
                    >
                      <span className="font-medium">
                        {formatDateShort(new Date(assignment.service.date))}
                      </span>
                      <span className="text-muted-foreground">
                        {assignment.service.type?.name ?? "Culto"} ·{" "}
                        {assignment.instrument.name}
                      </span>
                      <span className="ml-auto">
                        <ServiceStatusPill
                          status={assignment.service.status}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
