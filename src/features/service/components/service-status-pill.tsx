import type { ServiceStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  ServiceStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "outline" }
> = {
  RASCUNHO: { label: "Rascunho", variant: "secondary" },
  PLANEJAMENTO: { label: "Em planejamento", variant: "default" },
  CONFIRMADO: { label: "Confirmado", variant: "success" },
  CONCLUIDO: { label: "Concluído", variant: "outline" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
};

export function ServiceStatusPill({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
