// src/features/layoutManager/components/DroppableFieldList.tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutField } from '@/features/layouts/types';
import SortableFieldItem from './SortableFieldItem';

interface DroppableFieldListProps {
  fields: LayoutField[];
  onFieldRemove: (fieldId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<LayoutField>) => void;
}

export default function DroppableFieldList({
  fields,
  onFieldRemove,
  onFieldUpdate
}: DroppableFieldListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-field-list'
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`space-y-2 min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors
        ${isOver ? 'border-primary bg-primary/5' : 'border-muted'}`}
    >
      {fields.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          Drag fields here from the library
        </div>
      ) : (
        <SortableContext 
          items={fields.map(f => ({ id: f.id }))} 
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              onRemove={() => onFieldRemove(field.id)}
              onUpdate={(updates) => onFieldUpdate(field.id, updates)}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}