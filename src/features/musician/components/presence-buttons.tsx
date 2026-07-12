"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { respondPresenceAction } from "../actions";

interface PresenceButtonsProps {
  memberId: string;
  assignmentId: string;
}

/** Confirmar/recusar presença — a ação central do músico. */
export function PresenceButtons({
  memberId,
  assignmentId,
}: PresenceButtonsProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function respond(decision: "CONFIRMADO" | "RECUSADO") {
    setBusy(decision);
    const result = await respondPresenceAction(
      memberId,
      assignmentId,
      decision
    );
    setBusy(null);
    if (result.ok) {
      toast.success(
        decision === "CONFIRMADO"
          ? "Presença confirmada. Bom culto!"
          : "Resposta registrada — o líder será avisado."
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={busy !== null}
        onClick={() => respond("CONFIRMADO")}
      >
        {busy === "CONFIRMADO" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Check />
        )}
        Confirmar presença
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => respond("RECUSADO")}
      >
        {busy === "RECUSADO" ? <Loader2 className="animate-spin" /> : <X />}
        Não posso
      </Button>
    </div>
  );
}
