"use server";

import { revalidatePath } from "next/cache";
import type { InstrumentCategoryKey } from "@prisma/client";

import { getCurrentOrganization } from "@/server/org";
import * as memberService from "@/server/services/member";

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/configuracoes");
  // A escala e os seletores dependem dos instrumentos ativos.
  revalidatePath("/planejamento", "layout");
  revalidatePath("/equipe", "layout");
}

export async function toggleInstrumentAction(
  instrumentId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await memberService.setInstrumentActive(org.id, instrumentId, isActive);
    revalidate();
    return { ok: true };
  } catch (e) {
    console.error("toggleInstrumentAction", e);
    return { ok: false, error: "Não foi possível atualizar o instrumento." };
  }
}

export async function toggleCategoryAction(
  categoryKey: InstrumentCategoryKey,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await memberService.setCategoryActive(org.id, categoryKey, isActive);
    revalidate();
    return { ok: true };
  } catch (e) {
    console.error("toggleCategoryAction", e);
    return { ok: false, error: "Não foi possível atualizar a categoria." };
  }
}
