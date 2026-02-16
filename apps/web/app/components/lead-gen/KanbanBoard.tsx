import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  defaultDropAnimationSideEffects,
  type DropAnimation,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

export type Column = {
  id: string;
  title: string;
};

export type KanbanItem = {
  id: string;
  columnId: string;
  content: React.ReactNode;
  data?: unknown;
};

interface KanbanBoardProps {
  columns: Column[];
  items: KanbanItem[];
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  renderItem: (item: KanbanItem) => React.ReactNode;
  onItemClick?: (item: KanbanItem) => void;
}

// --- Draggable Item Wrapper ---

function SortableItem({ item, renderItem, onClick }: { item: KanbanItem; renderItem: (i: KanbanItem) => React.ReactNode, onClick?: (i: KanbanItem) => void }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'Item',
      item,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
      onClick={() => onClick?.(item)}
    >
      {renderItem(item)}
    </div>
  );
}

// --- Column Droppable ---

function KanbanColumn({ column, items, renderItem, onItemClick }: { column: Column; items: KanbanItem[]; renderItem: (item: KanbanItem) => React.ReactNode, onItemClick?: (item: KanbanItem) => void }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          {column.title}
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </h3>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-100/50 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]"
      >
        <SortableContext items={items.map((i) => i.id)}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} renderItem={renderItem} onClick={onItemClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// --- Main Board ---

export function KanbanBoard({ columns, items, onDragOver, onDragEnd, renderItem, onItemClick }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement starts drag
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Item') {
      setActiveItem(event.active.data.current.item);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            items={items.filter((i) => i.columnId === col.id)}
            renderItem={renderItem}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem && (
            <div className="opacity-90 rotate-2 cursor-grabbing">
               {renderItem(activeItem)}
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
