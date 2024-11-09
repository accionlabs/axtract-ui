import { useState } from 'react';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { useDraggable } from '@dnd-kit/core';
import { StandardField, LayoutType } from '@/features/layouts/types';
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

export interface FieldSelectorProps {
  selectedType: LayoutType;
  categories: string[];
  availableFields: StandardField[];
  // Remove onTypeChange as it's no longer needed
}

export default function FieldSelector({ 
  selectedType, 
  categories,
  availableFields
}: FieldSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group fields by category
  const groupedFields = availableFields.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, StandardField[]>);

  // Filter fields based on search query
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

  // Convert readonly array to mutable array for Accordion defaultValue
  const defaultExpandedCategories = [...categories];

  return (
    <Card className="w-full h-full border-0 rounded-none">
      <CardHeader className="px-4 py-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Field Library</span>
          <span className="text-sm font-normal capitalize text-muted-foreground">
            {selectedType} Layout
          </span>
        </CardTitle>
        <input
          type="search"
          placeholder="Search fields..."
          className="w-full px-3 py-2 text-sm border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </CardHeader>
      <CardContent className="px-2">
        <Accordion 
          type="multiple" 
          defaultValue={defaultExpandedCategories}
          className="space-y-2"
        >
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