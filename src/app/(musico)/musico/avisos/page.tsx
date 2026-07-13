import type { Metadata } from "next";
import { Megaphone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/lib/format";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { getPublishedForRole } from "@/server/services/communication";

export const metadata: Metadata = { title: "Avisos" };
export const dynamic = "force-dynamic";

export default async function AvisosPage() {
  const org = await getCurrentOrganization();
  const member = await getCurrentMember();
  if (!member) return null;

  // O App do Músico enxerga os avisos do papel MUSICO (ou de toda a equipe).
  const announcements = await getPublishedForRole(org.id, "MUSICO");

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Avisos</h1>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso no momento"
          description="Comunicados da liderança aparecem aqui."
        />
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.title}</p>
                    {a.body ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {a.body}
                      </p>
                    ) : null}
                    {a.publishedAt ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateShort(new Date(a.publishedAt))}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
