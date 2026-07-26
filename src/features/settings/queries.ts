import { getCurrentOrganization } from "@/server/org";
import * as memberService from "@/server/services/member";

/** Catálogo completo (ativos e inativos) para a tela de Configurações. */
export async function getInstrumentCatalog() {
  const org = await getCurrentOrganization();
  return memberService.getInstrumentCatalog(org.id);
}

export type InstrumentCatalog = Awaited<
  ReturnType<typeof getInstrumentCatalog>
>;
