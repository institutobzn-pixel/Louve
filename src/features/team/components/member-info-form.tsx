"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateMemberAction } from "../actions";
import type { MemberFormValues } from "../schema";
import { MemberForm } from "./member-form";

interface MemberInfoFormProps {
  memberId: string;
  defaultValues: Partial<MemberFormValues>;
}

export function MemberInfoForm({
  memberId,
  defaultValues,
}: MemberInfoFormProps) {
  const router = useRouter();

  async function handleSubmit(values: MemberFormValues) {
    const result = await updateMemberAction(memberId, values);
    if (result.ok) {
      toast.success("Dados salvos.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <MemberForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
    />
  );
}
