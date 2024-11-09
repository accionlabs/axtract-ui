// src/features/layoutManager/components/FieldSelector.tsx
import { useState } from 'react';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { useDraggable } from '@dnd-kit/core';
import { StandardField, LayoutType } from '@/features/layouts/types';
import { getFieldsByLayoutType, groupFieldsByCategory } from '../fieldConfigurations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DraggableFieldItemProps {
  field: StandardField;
}

const DraggableFieldItem = ({ field }: DraggableFieldItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${field.id}`,
    data: {
      type: 'FIELD',
      field: field,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 p-2 rounded-md border cursor-move hover:bg-accent transition-colors
        ${isDragging ? 'opacity-50 border-primary' : ''}`}
    >
      <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{field.name}</p>
        <p className="text-xs text-muted-foreground">{field.description}</p>
      </div>
    </div>
  );
};

interface FieldSelectorProps {
  selectedType: LayoutType;
  onTypeChange: (type: LayoutType) => void;
}

export default function FieldSelector({ selectedType, onTypeChange }: FieldSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const availableFields = getFieldsByLayoutType(selectedType);
  const groupedFields = groupFieldsByCategory(availableFields);

  const filteredGroups = Object.entries(groupedFields).reduce((acc, [category, fields]) => {
    const filteredFields = fields.filter(field =>
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredFields.length > 0) {
      acc[category] = filteredFields;
    }
    return acc;
  }, {} as Record<string, StandardField[]>);

  return (
    <Card className="w-full h-full border-0 rounded-none">
      <CardHeader className="px-4 py-2">
        <CardTitle className="text-lg">Field Library</CardTitle>
        <div className="space-y-2">
          <Select value={selectedType} onValueChange={(value) => onTypeChange(value as LayoutType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select layout type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claims">Claims Layout</SelectItem>
              <SelectItem value="wellness">Wellness Layout</SelectItem>
              <SelectItem value="eligibility">Eligibility Layout</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="search"
            placeholder="Search fields..."
            className="w-full px-3 py-2 text-sm border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <Accordion type="multiple" defaultValue={Object.keys(groupedFields)} className="space-y-2">
          {Object.entries(filteredGroups).map(([category, fields]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-sm font-medium py-2 px-2">
                {category} ({fields.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 p-2">
                  {fields.map((field) => (
                    <DraggableFieldItem key={field.id} field={field} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}