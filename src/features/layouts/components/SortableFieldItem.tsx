// src/features/layoutManager/components/SortableFieldItem.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { LayoutField } from '@/features/layouts/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortableFieldItemProps {
  field: LayoutField;
  onRemove: () => void;
  onUpdate: (updates: Partial<LayoutField>) => void;
}

export default function SortableFieldItem({
  field,
  onRemove,
  onUpdate
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-4 p-4 bg-white rounded-lg border ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move pt-2"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">{field.name}</h4>
            <p className="text-xs text-muted-foreground">{field.type}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={field.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={field.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={field.category}
              onChange={(e) => onUpdate({ category: e.target.value })}
              className="h-8"
            />
          </div>

          {field.validation?.enum && (
            <div className="space-y-2">
              <Label>Allowed Values</Label>
              <Select
                value={field.customProperties?.defaultValue}
                onValueChange={(value) => 
                  onUpdate({ 
                    customProperties: { 
                      ...field.customProperties,
                      defaultValue: value 
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default value" />
                </SelectTrigger>
                <SelectContent>
                  {field.validation.enum.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
            <Label>Required</Label>
          </div>
          
          {field.validation?.pattern && (
            <div className="flex items-center space-x-2">
              <Label>Pattern:</Label>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {field.validation.pattern}
              </code>
            </div>
          )}
        </div>

        {field.validation && (
          <div className="grid grid-cols-2 gap-4">
            {field.validation.minLength !== undefined && (
              <div className="space-y-2">
                <Label>Min Length</Label>
                <Input
                  type="number"
                  value={field.validation.minLength}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...field.validation,
                      minLength: parseInt(e.target.value)
                    }
                  })}
                  className="h-8"
                />
              </div>
            )}
            {field.validation.maxLength !== undefined && (
              <div className="space-y-2">
                <Label>Max Length</Label>
                <Input
                  type="number"
                  value={field.validation.maxLength}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...field.validation,
                      maxLength: parseInt(e.target.value)
                    }
                  })}
                  className="h-8"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}