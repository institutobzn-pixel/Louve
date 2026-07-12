import Link from "next/link";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MemberListItem } from "@/server/services/member";
import { skillLevelLabels } from "../schema";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function MemberCard({ member }: { member: MemberListItem }) {
  return (
    <Link href={`/equipe/${member.id}`} className="block">
      <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 animate-fade-in-up">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="bg-primary/10 font-medium text-primary">
            {initials(member.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{member.name}</span>
            {!member.isActive ? (
              <Badge variant="secondary">Inativo</Badge>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {member.instruments.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Sem instrumentos definidos
              </span>
            ) : (
              member.instruments.slice(0, 4).map((mi) => (
                <Badge
                  key={mi.instrumentId}
                  variant={mi.isPrimary ? "default" : "secondary"}
                  className="gap-1"
                >
                  {mi.isPrimary ? <Star className="h-2.5 w-2.5" /> : null}
                  {mi.instrument.name}
                </Badge>
              ))
            )}
            {member.instruments.length > 4 ? (
              <span className="text-xs text-muted-foreground">
                +{member.instruments.length - 4}
              </span>
            ) : null}
          </div>
        </div>

        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {skillLevelLabels[member.level]}
        </span>
      </Card>
    </Link>
  );
}
