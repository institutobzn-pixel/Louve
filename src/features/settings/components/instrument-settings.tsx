"use client";

import * as React from "react";
import type { InstrumentCategoryKey } from "@prisma/client";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { InstrumentIcon } from "@/components/shared/instrument-icon";
import { cn } from "@/lib/utils";
import { toggleCategoryAction, toggleInstrumentAction } from "../actions";
import type { InstrumentCatalog } from "../queries";

export function InstrumentSettings({
  catalog,
}: {
  catalog: InstrumentCatalog;
}) {
  const [data, setData] = React.useState(catalog);

  async function toggleInstrument(
    catKey: string,
    id: string,
    isActive: boolean
  ) {
    const prev = data;
    setData((d) =>
      d.map((c) =>
        c.key !== catKey
          ? c
          : {
              ...c,
              instruments: c.instruments.map((i) =>
                i.id === id ? { ...i, isActive } : i
              ),
            }
      )
    );
    const res = await toggleInstrumentAction(id, isActive);
    if (!res.ok) {
      toast.error(res.error);
      setData(prev);
    }
  }

  async function toggleCategory(catKey: string, isActive: boolean) {
    const prev = data;
    setData((d) =>
      d.map((c) =>
        c.key !== catKey
          ? c
          : {
              ...c,
              instruments: c.instruments.map((i) => ({ ...i, isActive })),
            }
      )
    );
    const res = await toggleCategoryAction(
      catKey as InstrumentCategoryKey,
      isActive
    );
    if (!res.ok) {
      toast.error(res.error);
      setData(prev);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((category) => {
        const activeCount = category.instruments.filter(
          (i) => i.isActive
        ).length;
        const anyActive = activeCount > 0;
        return (
          <Card key={category.key} className={cn(!anyActive && "opacity-70")}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-200 text-violet-600">
                <InstrumentIcon
                  categoryKey={category.key}
                  className="h-[18px] w-[18px]"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{category.label}</p>
                <p className="text-xs text-muted-foreground">
                  {activeCount} de {category.instruments.length} em uso
                </p>
              </div>
              <Switch
                checked={anyActive}
                onCheckedChange={(v) => toggleCategory(category.key, v)}
                aria-label={`Usar categoria ${category.label}`}
              />
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {category.instruments.map((inst) => (
                <label
                  key={inst.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                >
                  <InstrumentIcon
                    name={inst.name}
                    categoryKey={category.key}
                    className={cn(
                      "h-4 w-4 shrink-0",
                      inst.isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      !inst.isActive && "text-muted-foreground line-through"
                    )}
                  >
                    {inst.name}
                  </span>
                  <Switch
                    checked={inst.isActive}
                    onCheckedChange={(v) =>
                      toggleInstrument(category.key, inst.id, v)
                    }
                    aria-label={`Usar ${inst.name}`}
                  />
                </label>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
