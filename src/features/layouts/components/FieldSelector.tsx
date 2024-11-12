import { useState } from 'react';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { useDraggable } from '@dnd-kit/core';
import { StandardField, LayoutType } from '../types';
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSampleDataForField } from '../mockData';
import { cn } from "@/lib/utils";

// Component for individual draggable field
interface DraggableFieldItemProps {
  field: StandardField;
  sampleData?: any;
}

const DraggableFieldItem = ({ field, sampleData }: DraggableFieldItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${field.id}`,
    data: {
      type: 'FIELD',
      field: {
        ...field,
        order: 0, // Default order, will be updated when dropped
        customProperties: {}
      },
    },
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
              "flex items-start gap-2 p-3 rounded-md border cursor-move hover:bg-accent transition-colors",
              isDragging ? "opacity-50 border-primary shadow-lg" : "",
              field.required ? "border-yellow-200" : "border-gray-200"
            )}
          >
            <DragHandleDots2Icon className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{field.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {field.type}
                </Badge>
                {field.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Field Details</p>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Type:</span> {field.type}</p>
                {field.validation && Object.entries(field.validation).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-medium capitalize">{key}:</span> {
                      Array.isArray(value) ? value.join(', ') : value.toString()
                    }
                  </p>
                ))}
              </div>
            </div>
            {sampleData !== undefined && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Sample Data</p>
                <code className="text-xs bg-muted p-1 rounded">
                  {typeof sampleData === 'object' 
                    ? JSON.stringify(sampleData) 
                    : String(sampleData)
                  }
                </code>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Filter options type
type FilterOption = 'all' | 'required' | 'optional';

// Main FieldSelector component props
export interface FieldSelectorProps {
  selectedType: LayoutType;
  categories: string[];
  availableFields: StandardField[];
}

export default function FieldSelector({ 
  selectedType, 
  categories,
  availableFields
}: FieldSelectorProps) {
  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter fields based on search query and filter options
  const filteredFields = availableFields.filter(field => {
    const matchesSearch = 
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterOption === 'all' ||
      (filterOption === 'required' && field.required) ||
      (filterOption === 'optional' && !field.required);

    const matchesCategory =
      selectedCategory === 'all' ||
      field.category === selectedCategory;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  // Group fields by category
  const groupedFields = filteredFields.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, StandardField[]>);

  // Get all unique categories
  const allCategories = ['all', ...categories];

  // Generate sample data for fields
  const sampleData = availableFields.reduce((acc, field) => {
    acc[field.id] = generateSampleDataForField({
      ...field,
      order: 0,
      customProperties: {}
    });
    return acc;
  }, {} as Record<string, any>);

  return (
    <Card className="w-full h-full border-0 rounded-none">
      <CardHeader className="px-4 py-2 space-y-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Field Library</span>
          <Badge variant="secondary" className="capitalize">
            {selectedType} Layout
          </Badge>
        </CardTitle>

        <div className="space-y-2">
          <Input
            type="search"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filterOption} 
              onValueChange={(value: FilterOption) => setFilterOption(value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Filter fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="required">Required Only</SelectItem>
                <SelectItem value="optional">Optional Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <ScrollArea className="h-[calc(100vh-15rem)]">
          {Object.keys(groupedFields).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No fields match your search criteria
            </div>
          ) : (
            <Accordion 
              type="multiple" 
              defaultValue={categories}
              className="space-y-2"
            >
              {Object.entries(groupedFields).map(([category, fields]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-sm font-medium py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span>{category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {fields.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-2">
                      {fields.map((field) => (
                        <DraggableFieldItem 
                          key={field.id} 
                          field={field} 
                          sampleData={sampleData[field.id]}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>

        <div className="mt-4 px-2 py-3 border-t">
          <div className="text-xs text-muted-foreground">
            {filteredFields.length} of {availableFields.length} fields shown
          </div>
        </div>
      </CardContent>
    </Card>
  );
}