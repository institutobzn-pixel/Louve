"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { Clock, ListMusic } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { formatDuration } from "@/lib/format";
import {
  removeSetlistItemAction,
  reorderSetlistAction,
} from "../actions";
import type { SetlistItemView } from "../types";
import { SetlistItemEditDialog } from "./setlist-item-edit-dialog";
import { SetlistItemRow } from "./setlist-item-row";
import { SongPicker } from "./song-picker";

interface SetlistBoardProps {
  serviceId: string;
  setlistId: string;
  items: SetlistItemView[];
}

export function SetlistBoard({
  serviceId,
  setlistId,
  items: serverItems,
}: SetlistBoardProps) {
  const router = useRouter();
  const [items, setItems] = React.useState(serverItems);
  const [editing, setEditing] = React.useState<SetlistItemView | null>(null);

  // Reconcilia com o servidor após revalidação (adicionar/editar/remover).
  React.useEffect(() => setItems(serverItems), [serverItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    // Atualização otimista; reverte se o servidor falhar.
    setItems(reordered);
    const result = await reorderSetlistAction(
      serviceId,
      setlistId,
      reordered.map((i) => i.id)
    );
    if (!result.ok) {
      setItems(items);
      toast.error(result.error);
    }
  }

  async function handleRemove(item: SetlistItemView) {
    const previous = items;
    setItems(items.filter((i) => i.id !== item.id));
    const result = await removeSetlistItemAction(serviceId, item.id);
    if (result.ok) {
      toast.success(`"${item.song.name}" removida do setlist.`);
      router.refresh();
    } else {
      setItems(previous);
      toast.error(result.error);
    }
  }

  const totalSeconds = items.reduce((sum, i) => sum + (i.durationSec ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ListMusic className="h-4 w-4" />
          {items.length} música{items.length === 1 ? "" : "s"}
          {totalSeconds > 0 ? (
            <span className="inline-flex items-center gap-1">
              · <Clock className="h-3.5 w-3.5" />
              {formatDuration(totalSeconds)}
            </span>
          ) : null}
        </div>
        <SongPicker serviceId={serviceId} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Setlist vazio"
          description="Adicione músicas da Biblioteca Oficial ou das Músicas em Implantação — e reordene arrastando."
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.map((item, index) => (
                <SetlistItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={setEditing}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <SetlistItemEditDialog
        serviceId={serviceId}
        item={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
