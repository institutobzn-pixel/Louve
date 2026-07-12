"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, StickyNote, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SetlistItemView } from "../types";

interface SetlistItemRowProps {
  item: SetlistItemView;
  index: number;
  onEdit: (item: SetlistItemView) => void;
  onRemove: (item: SetlistItemView) => void;
}

export function SetlistItemRow({
  item,
  index,
  onEdit,
  onRemove,
}: SetlistItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card p-3 shadow-sm",
        isDragging && "z-10 border-primary/50 shadow-lg"
      )}
    >
      <button
        type="button"
        aria-label={`Reordenar ${item.song.name}`}
        className="cursor-grab touch-none rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="w-6 shrink-0 text-center text-sm font-medium text-muted-foreground">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{item.song.name}</span>
          {item.versionLabel ? (
            <Badge variant="secondary">{item.versionLabel}</Badge>
          ) : null}
        </div>
        {item.song.artist ? (
          <p className="truncate text-xs text-muted-foreground">
            {item.song.artist}
          </p>
        ) : null}
      </div>

      <div className="hidden items-center gap-1.5 sm:flex">
        {item.keyOverride ? (
          <Badge variant="outline" className="font-mono">
            {item.keyOverride}
          </Badge>
        ) : null}
        {item.bpmOverride ? (
          <Badge variant="outline" className="font-mono">
            {item.bpmOverride} bpm
          </Badge>
        ) : null}
        {item.durationSec ? (
          <Badge variant="outline" className="font-mono">
            {formatDuration(item.durationSec)}
          </Badge>
        ) : null}
        {item.notes ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground">
                <StickyNote className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{item.notes}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Editar ${item.song.name}`}
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remover ${item.song.name}`}
          className="text-muted-foreground hover:text-danger"
          onClick={() => onRemove(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
