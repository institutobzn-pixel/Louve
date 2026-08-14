"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  serviceFormSchema,
  type ServiceFormValues,
} from "@/features/service/schema";

export interface SelectOption {
  value: string;
  label: string;
}

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormValues>;
  typeOptions: SelectOption[];
  memberOptions: SelectOption[];
  submitLabel: string;
  onSubmit: (values: ServiceFormValues) => Promise<void> | void;
}

const NONE = "__none__";

/**
 * Formulário de informações do culto — compartilhado entre a criação
 * (dialog) e a edição (aba Informações).
 */
export function ServiceForm({
  defaultValues,
  typeOptions,
  memberOptions,
  submitLabel,
  onSubmit,
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      date: "",
      startTime: "",
      typeId: "",
      worshipLeaderId: "",
      notes: "",
      ...defaultValues,
    },
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const { errors, isSubmitting } = formState;

  const typeId = watch("typeId");
  const worshipLeaderId = watch("worshipLeaderId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date ? (
            <p className="text-xs text-danger">{errors.date.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="startTime">Horário</Label>
          <Input id="startTime" type="time" {...register("startTime")} />
          {errors.startTime ? (
            <p className="text-xs text-danger">{errors.startTime.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipo de culto</Label>
          <Select
            value={typeId || NONE}
            onValueChange={(v) => setValue("typeId", v === NONE ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem tipo</SelectItem>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Ministro de Louvor</Label>
          <Select
            value={worshipLeaderId || NONE}
            onValueChange={(v) =>
              setValue("worshipLeaderId", v === NONE ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ministro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Não definido</SelectItem>
              {memberOptions.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  Cadastre a equipe no módulo Equipe
                </SelectItem>
              ) : (
                memberOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Anotações gerais do planejamento"
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
