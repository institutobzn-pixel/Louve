"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VocalRangeCapture } from "@/components/shared/vocal-range-capture";
import {
  memberFormSchema,
  skillLevelLabels,
  skillLevels,
  type MemberFormValues,
} from "../schema";

interface MemberFormProps {
  defaultValues?: Partial<MemberFormValues>;
  submitLabel: string;
  onSubmit: (values: MemberFormValues) => Promise<void> | void;
}

/** Formulário do músico — compartilhado entre criação e edição. */
export function MemberForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: MemberFormProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthday: "",
      level: "INTERMEDIARIO",
      notes: "",
      ...defaultValues,
    },
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const level = watch("level");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="m-name">Nome *</Label>
        <Input id="m-name" {...register("name")} />
        {formState.errors.name ? (
          <p className="text-xs text-danger">{formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="m-email">E-mail</Label>
          <Input id="m-email" type="email" {...register("email")} />
          {formState.errors.email ? (
            <p className="text-xs text-danger">
              {formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-phone">Telefone</Label>
          <Input id="m-phone" placeholder="(00) 00000-0000" {...register("phone")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="m-birthday">Aniversário</Label>
          <Input id="m-birthday" type="date" {...register("birthday")} />
        </div>
        <div className="space-y-1.5">
          <Label>Nível geral</Label>
          <Select
            value={level}
            onValueChange={(v) => setValue("level", v as MemberFormValues["level"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {skillLevelLabels[lvl]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <VocalRangeCapture
        low={watch("vocalLowNote") ?? null}
        high={watch("vocalHighNote") ?? null}
        onChange={({ low, high }) => {
          setValue("vocalLowNote", low, { shouldDirty: true });
          setValue("vocalHighNote", high, { shouldDirty: true });
        }}
      />

      <div className="space-y-1.5">
        <Label htmlFor="m-notes">Observações</Label>
        <Textarea id="m-notes" rows={3} {...register("notes")} />
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
