"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setMemberActiveAction } from "../actions";

interface MemberActiveToggleProps {
  memberId: string;
  isActive: boolean;
}

export function MemberActiveToggle({
  memberId,
  isActive,
}: MemberActiveToggleProps) {
  const router = useRouter();

  async function handleChange(next: boolean) {
    const result = await setMemberActiveAction(memberId, next);
    if (result.ok) {
      toast.success(next ? "Músico ativado." : "Músico inativado.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="member-active"
        checked={isActive}
        onCheckedChange={handleChange}
      />
      <Label htmlFor="member-active" className="cursor-pointer">
        Ativo
      </Label>
    </div>
  );
}
