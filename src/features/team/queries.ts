import { getCurrentOrganization } from "@/server/org";
import * as memberService from "@/server/services/member";

export async function getTeamMembers(query?: string) {
  const org = await getCurrentOrganization();
  return memberService.getMembers(org.id, query);
}

export async function getMemberProfile(memberId: string) {
  const org = await getCurrentOrganization();
  return memberService.getMemberById(org.id, memberId);
}

export async function getInstrumentOptions() {
  const org = await getCurrentOrganization();
  return memberService.getInstrumentsByCategory(org.id);
}
