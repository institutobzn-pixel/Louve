"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setDevMemberAction } from "../actions";

interface DevMemberSwitcherProps {
  members: Array<{ id: string; name: string }>;
  currentId: string;
}

/**
 * Seletor "visualizar como" — identidade de desenvolvimento até o
 * Supabase Auth entrar. Some quando o login real for ativado.
 */
export function DevMemberSwitcher({
  members,
  currentId,
}: DevMemberSwitcherProps) {
  const router = useRouter();

  async function handleChange(memberId: string) {
    const result = await setDevMemberAction(memberId);
    if (result.ok) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Select value={currentId} onValueChange={handleChange}>
      <SelectTrigger
        className="h-8 w-44 text-xs"
        aria-label="Visualizar como músico"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
