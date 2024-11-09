import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutField } from '@/features/layouts/types';
import SortableFieldItem from './SortableFieldItem';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragHandleDots2Icon } from '@radix-ui/react-icons';

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

  // Group fields by category
  const groupedFields = fields.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, LayoutField[]>);

  // Calculate validation status for each field
  const getFieldValidationStatus = (field: LayoutField): 'valid' | 'invalid' | 'warning' => {
    if (!field.name || field.name.trim() === '') return 'invalid';
    if (!field.description || field.description.trim() === '') return 'warning';
    if (field.required && field.validation && Object.keys(field.validation).length === 0) return 'warning';
    return 'valid';
  };

  // Get validation status counts
  const validationCounts = fields.reduce((acc, field) => {
    const status = getFieldValidationStatus(field);
    acc[status]++;
    return acc;
  }, { valid: 0, invalid: 0, warning: 0 });

  return (
    <div className="space-y-4">
      {/* Validation Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            {validationCounts.valid} Valid
          </Badge>
          {validationCounts.warning > 0 && (
            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
              {validationCounts.warning} Warnings
            </Badge>
          )}
          {validationCounts.invalid > 0 && (
            <Badge variant="default" className="bg-red-100 text-red-800">
              {validationCounts.invalid} Invalid
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {fields.length} total fields configured
        </div>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef} 
        className={`min-h-[200px] rounded-lg transition-colors
          ${isOver ? 'bg-primary/5 border-2 border-dashed border-primary' : 
            fields.length === 0 ? 'border-2 border-dashed border-muted' : ''}`}
      >
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <DragHandleDots2Icon className="h-8 w-8 mb-2" />
            <p>Drag fields here from the library</p>
            <p className="text-sm">Fields will be automatically organized by category</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] rounded-lg">
            <SortableContext 
              items={fields.map(f => ({ id: f.id }))} 
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="multiple" defaultValue={Object.keys(groupedFields)} className="px-4">
                {Object.entries(groupedFields).map(([category, categoryFields]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span>{category}</span>
                        <Badge variant="secondary" className="ml-2">
                          {categoryFields.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {categoryFields.map((field) => (
                          <SortableFieldItem
                            key={field.id}
                            field={field}
                            validationStatus={getFieldValidationStatus(field)}
                            onRemove={() => onFieldRemove(field.id)}
                            onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </SortableContext>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}