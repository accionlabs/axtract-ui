import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SortableFieldItemProps {
  field: LayoutField;
  validationStatus: 'valid' | 'invalid' | 'warning';
  onRemove: () => void;
  onUpdate: (updates: Partial<LayoutField>) => void;
}

interface ValidationMessage {
  message: string;
  type: 'error' | 'warning';
}

export default function SortableFieldItem({
  field,
  validationStatus,
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
  } = useSortable({
    id: field.id,
    data: {
      type: 'LAYOUT_FIELD',
      field
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get validation messages based on field state
  const getValidationMessages = (): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];

    if (!field.name || field.name.trim() === '') {
      messages.push({ message: 'Field name is required', type: 'error' });
    }
    if (!field.description || field.description.trim() === '') {
      messages.push({ message: 'Description is recommended', type: 'warning' });
    }
    if (field.required && (!field.validation || Object.keys(field.validation).length === 0)) {
      messages.push({ message: 'Validation rules recommended for required field', type: 'warning' });
    }

    // Type-specific validations
    if (field.type === 'string' && field.validation?.maxLength === undefined) {
      messages.push({ message: 'Consider adding max length validation', type: 'warning' });
    }
    if (field.type === 'decimal' && field.validation?.precision === undefined) {
      messages.push({ message: 'Consider adding decimal precision', type: 'warning' });
    }

    return messages;
  };

  // Get status icon based on validation status
  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const validationMessages = getValidationMessages();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card transition-all",
        isDragging && "opacity-50 shadow-lg",
        validationStatus === 'invalid' && "border-red-200",
        validationStatus === 'warning' && "border-yellow-200",
        validationStatus === 'valid' && "border-green-200"
      )}
    >
      <Collapsible>
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-move"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={field.name}
                      onChange={(e) => onUpdate({ name: e.target.value })}
                      className={cn(
                        "h-7 w-[200px] font-medium",
                        !field.name && "border-red-500"
                      )}
                      placeholder="Field name"
                    />
                    <Badge variant="outline" className="text-xs">
                      {field.type}
                    </Badge>
                    {field.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={field.description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    className="h-7 text-sm text-muted-foreground"
                    placeholder="Field description"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {getStatusIcon()}
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          {validationMessages.map((msg, idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "text-xs",
                                msg.type === 'error' ? "text-red-500" : "text-yellow-500"
                              )}
                            >
                              {msg.message}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={field.category}
                  onChange={(e) => onUpdate({ category: e.target.value })}
                  className="h-8"
                  placeholder="Field category"
                />
              </div>

              {field.type === 'string' && (
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => onUpdate({
                      validation: {
                        ...field.validation,
                        maxLength: parseInt(e.target.value)
                      }
                    })}
                    className="h-8"
                    placeholder="Maximum length"
                  />
                </div>
              )}

              {field.type === 'decimal' && (
                <div className="space-y-2">
                  <Label>Decimal Precision</Label>
                  <Input
                    type="number"
                    value={field.validation?.precision || ''}
                    onChange={(e) => onUpdate({
                      validation: {
                        ...field.validation,
                        precision: parseInt(e.target.value)
                      }
                    })}
                    className="h-8"
                    placeholder="Decimal places"
                  />
                </div>
              )}
            </div>

            {/* Pattern Validation */}
            {field.type === 'string' && (
              <div className="space-y-2">
                <Label>Pattern Validation</Label>
                <Input
                  value={field.validation?.pattern || ''}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...field.validation,
                      pattern: e.target.value
                    }
                  })}
                  className="h-8 font-mono"
                  placeholder="Regular expression pattern"
                />
              </div>
            )}

            {/* Enumerated Values */}
            {field.validation?.enum && (
              <div className="space-y-2">
                <Label>Default Value</Label>
                <Select
                  value={field.customProperties?.defaultValue}
                  onValueChange={(value) => onUpdate({
                    customProperties: {
                      ...field.customProperties,
                      defaultValue: value
                    }
                  })}
                >
                  <SelectTrigger className="h-8">
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

            {/* Additional Field Properties */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                />
                <Label>Required</Label>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}