"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateServiceInfoAction } from "@/features/service/actions";
import type { ServiceFormValues } from "@/features/service/schema";
import {
  ServiceForm,
  type SelectOption,
} from "./service-form";

interface ServiceInfoFormProps {
  serviceId: string;
  defaultValues: Partial<ServiceFormValues>;
  typeOptions: SelectOption[];
  memberOptions: SelectOption[];
}

export function ServiceInfoForm({
  serviceId,
  defaultValues,
  typeOptions,
  memberOptions,
}: ServiceInfoFormProps) {
  const router = useRouter();

  async function handleSubmit(values: ServiceFormValues) {
    const result = await updateServiceInfoAction(serviceId, values);
    if (result.ok) {
      toast.success("Informações salvas.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <ServiceForm
      defaultValues={defaultValues}
      typeOptions={typeOptions}
      memberOptions={memberOptions}
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
    />
  );
}
