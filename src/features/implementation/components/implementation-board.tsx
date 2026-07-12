"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { ImplementationStage } from "@prisma/client";
import { GripVertical, Music2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { moveStageAction, removeImplementationAction } from "../actions";
import { orderedStages, stageConfig } from "../config";

export interface BoardCard {
  id: string;
  stage: ImplementationStage;
  songName: string;
  artist: string | null;
  originalKey: string | null;
  versionCount: number;
}

interface ImplementationBoardProps {
  cards: BoardCard[];
}

export function ImplementationBoard({
  cards: serverCards,
}: ImplementationBoardProps) {
  const router = useRouter();
  const [cards, setCards] = React.useState(serverCards);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => setCards(serverCards), [serverCards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const targetStage = String(over.id) as ImplementationStage;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.stage === targetStage) return;

    const previous = cards;
    const position = cards.filter((c) => c.stage === targetStage).length;

    // Otimista: move o card; se for IMPLANTADA, ele sai do board.
    if (targetStage === "IMPLANTADA") {
      setCards(cards.filter((c) => c.id !== cardId));
    } else {
      setCards(
        cards.map((c) => (c.id === cardId ? { ...c, stage: targetStage } : c))
      );
    }

    const result = await moveStageAction(cardId, targetStage, position);
    if (result.ok) {
      if (result.data.implanted) {
        toast.success(
          `"${card.songName}" implantada — migrou para a Biblioteca Musical.`
        );
      }
      router.refresh();
    } else {
      setCards(previous);
      toast.error(result.error);
    }
  }

  async function handleRemove(card: BoardCard) {
    const previous = cards;
    setCards(cards.filter((c) => c.id !== card.id));
    const result = await removeImplementationAction(card.id);
    if (result.ok) {
      toast.success(`"${card.songName}" removida do pipeline.`);
      router.refresh();
    } else {
      setCards(previous);
      toast.error(result.error);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {orderedStages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            cards={cards.filter((c) => c.stage === stage)}
            activeId={activeId}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </DndContext>
  );
}

function StageColumn({
  stage,
  cards,
  activeId,
  onRemove,
}: {
  stage: ImplementationStage;
  cards: BoardCard[];
  activeId: string | null;
  onRemove: (card: BoardCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const config = stageConfig[stage];

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("h-2 w-2 rounded-full", config.accent)} />
        <h3 className="text-sm font-semibold">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {cards.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-2xl border border-dashed p-2 transition-colors",
          isOver ? "border-primary bg-accent/40" : "border-border"
        )}
      >
        {cards.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {stage === "IMPLANTADA"
              ? "Solte aqui para migrar à Biblioteca"
              : config.hint}
          </p>
        ) : (
          cards.map((card) => (
            <ImplementationCard
              key={card.id}
              card={card}
              dragging={activeId === card.id}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ImplementationCard({
  card,
  dragging,
  onRemove,
}: {
  card: BoardCard;
  dragging: boolean;
  onRemove: (card: BoardCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? {
              transform: `translate(${transform.x}px, ${transform.y}px)`,
              zIndex: 50,
            }
          : undefined
      }
      className={cn(
        "group rounded-xl border bg-card p-3 shadow-sm",
        dragging && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Mover ${card.songName}`}
          className="mt-0.5 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{card.songName}</p>
          {card.artist ? (
            <p className="truncate text-xs text-muted-foreground">
              {card.artist}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {card.originalKey ? (
              <Badge variant="outline" className="font-mono">
                {card.originalKey}
              </Badge>
            ) : null}
            {card.versionCount > 0 ? (
              <Badge variant="secondary" className="gap-1">
                <Music2 className="h-3 w-3" /> {card.versionCount}
              </Badge>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remover ${card.songName}`}
          className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
          onClick={() => onRemove(card)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
