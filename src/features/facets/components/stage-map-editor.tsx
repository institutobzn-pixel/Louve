"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { saveStagePositionsAction } from "../actions";

export interface StagePin {
  key: string;              // id local estável
  assignmentId: string | null;
  label: string;            // nome exibido (músico ou rótulo livre)
  sublabel?: string | null; // instrumento
  x: number;                // 0–100 (%)
  y: number;                // 0–100 (%)
}

export interface StageAssignmentOption {
  assignmentId: string;
  memberName: string;
  instrumentName: string;
}

interface StageMapEditorProps {
  serviceId: string;
  initialPins: StagePin[];
  assignments: StageAssignmentOption[];
}

/**
 * Mapa de palco: posicionamento gráfico dos músicos por arraste.
 * As posições são percentuais — o mapa é responsivo.
 */
export function StageMapEditor({
  serviceId,
  initialPins,
  assignments,
}: StageMapEditorProps) {
  const [pins, setPins] = React.useState<StagePin[]>(initialPins);
  const [selection, setSelection] = React.useState("");
  const [customLabel, setCustomLabel] = React.useState("");
  const stageRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const usedAssignmentIds = new Set(
    pins.map((pin) => pin.assignmentId).filter(Boolean)
  );
  const availableAssignments = assignments.filter(
    (a) => !usedAssignmentIds.has(a.assignmentId)
  );

  async function persist(next: StagePin[]) {
    setPins(next);
    const result = await saveStagePositionsAction(
      serviceId,
      next.map((pin) => ({
        assignmentId: pin.assignmentId,
        label: pin.assignmentId ? pin.sublabel ?? null : pin.label,
        x: Math.round(pin.x * 100) / 100,
        y: Math.round(pin.y * 100) / 100,
      }))
    );
    if (!result.ok) toast.error(result.error);
  }

  function handleDragEnd(event: DragEndEvent) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const next = pins.map((pin) => {
      if (pin.key !== event.active.id) return pin;
      const px = (pin.x / 100) * rect.width + event.delta.x;
      const py = (pin.y / 100) * rect.height + event.delta.y;
      return {
        ...pin,
        x: Math.min(100, Math.max(0, (px / rect.width) * 100)),
        y: Math.min(100, Math.max(0, (py / rect.height) * 100)),
      };
    });
    void persist(next);
  }

  function addPin() {
    if (selection && selection !== "__custom__") {
      const assignment = assignments.find(
        (a) => a.assignmentId === selection
      );
      if (!assignment) return;
      void persist([
        ...pins,
        {
          key: assignment.assignmentId,
          assignmentId: assignment.assignmentId,
          label: assignment.memberName,
          sublabel: assignment.instrumentName,
          x: 50,
          y: 50,
        },
      ]);
      setSelection("");
      return;
    }
    if (selection === "__custom__" && customLabel.trim()) {
      void persist([
        ...pins,
        {
          key: `label-${Date.now()}`,
          assignmentId: null,
          label: customLabel.trim(),
          x: 50,
          y: 70,
        },
      ]);
      setCustomLabel("");
      setSelection("");
    }
  }

  function removePin(pin: StagePin) {
    void persist(pins.filter((p) => p.key !== pin.key));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-52">
          <Select value={selection} onValueChange={setSelection}>
            <SelectTrigger aria-label="Adicionar ao palco">
              <SelectValue placeholder="Adicionar ao palco…" />
            </SelectTrigger>
            <SelectContent>
              {availableAssignments.map((assignment) => (
                <SelectItem
                  key={assignment.assignmentId}
                  value={assignment.assignmentId}
                >
                  {assignment.memberName} · {assignment.instrumentName}
                </SelectItem>
              ))}
              <SelectItem value="__custom__">
                Rótulo livre (ex.: Púlpito, Mesa de som)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selection === "__custom__" ? (
          <Input
            placeholder="Nome do rótulo"
            className="w-48"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
        ) : null}
        <Button
          variant="outline"
          onClick={addPin}
          disabled={
            !selection || (selection === "__custom__" && !customLabel.trim())
          }
        >
          <Plus /> Posicionar
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={stageRef}
          className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted/30"
        >
          {/* Frente do palco */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-8 items-center justify-center border-t border-dashed text-[11px] uppercase tracking-widest text-muted-foreground">
            Frente do palco · Congregação
          </div>

          {pins.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-6 w-6" />
              <p className="text-sm">
                Adicione músicos e arraste para posicionar.
              </p>
            </div>
          ) : null}

          {pins.map((pin) => (
            <StagePinNode key={pin.key} pin={pin} onRemove={removePin} />
          ))}
        </div>
      </DndContext>

      <p className="text-xs text-muted-foreground">
        As posições são salvas automaticamente ao soltar o pino.
      </p>
    </div>
  );
}

function StagePinNode({
  pin,
  onRemove,
}: {
  pin: StagePin;
  onRemove: (pin: StagePin) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: pin.key });

  return (
    <div
      ref={setNodeRef}
      style={{
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        transform: `translate(-50%, -50%) ${
          transform ? `translate(${transform.x}px, ${transform.y}px)` : ""
        }`,
      }}
      className={cn(
        "group absolute z-10 touch-none select-none",
        isDragging && "z-20"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        role="button"
        aria-label={`Mover ${pin.label}`}
        className={cn(
          "flex cursor-grab flex-col items-center rounded-xl border bg-card px-3 py-1.5 shadow-sm transition-shadow active:cursor-grabbing",
          isDragging && "border-primary/60 shadow-lg",
          pin.assignmentId ? "border-primary/30" : "border-dashed"
        )}
      >
        <span className="max-w-28 truncate text-xs font-medium">
          {pin.label}
        </span>
        {pin.sublabel ? (
          <span className="max-w-28 truncate text-[10px] text-muted-foreground">
            {pin.sublabel}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`Remover ${pin.label} do palco`}
        onClick={() => onRemove(pin)}
        className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-danger text-danger-foreground shadow group-hover:flex"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
