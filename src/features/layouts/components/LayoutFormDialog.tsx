import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import mock data and types
import {
  getLibraryFieldsByType,
  generateSampleDataForField,
  FIELD_CATEGORIES
} from '../mockData';
import { Layout, LayoutField, StandardField, LayoutFormValues, LayoutType, Field } from '../types';
// Add Field type
import FieldSelector from './FieldSelector';
import DroppableFieldList from './DroppableFieldList';

// Define layout type for the form
type FormLayoutType = 'claims' | 'eligibility' | 'wellness';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['claims', 'eligibility', 'wellness'] as const),
  fields: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Field name is required'),
    type: z.enum(['string', 'number', 'date', 'boolean', 'decimal']),
    description: z.string(),
    required: z.boolean(),
    category: z.string(),
    order: z.number(),
    validation: z.object({
      required: z.boolean().optional(),
      pattern: z.string().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      precision: z.number().optional(),
      enum: z.array(z.string()).optional(),
    }).optional(),
    customProperties: z.record(z.any()).optional()
  }))
});

// Create separate type guards for Field and StandardField
const isStandardField = (field: any): field is StandardField => {
  return 'id' in field && 'name' in field && 'type' in field && 'category' in field;
};

// Update the conversion function to handle both types safely
const convertFieldToLayoutField = (field: StandardField | Field, order: number): LayoutField => {
  const isStd = isStandardField(field);

  return {
    id: `field-${Date.now()}-${order}`,
    name: field.name,
    type: field.type,
    description: field.description,
    required: field.required,
    // Use type guard to safely access StandardField properties
    category: isStd ? field.category : 'General',
    order,
    // Use type guard to safely access StandardField properties
    validation: isStd ? field.validation || {} : {},
    customProperties: {}
  };
};

type FormSchema = z.infer<typeof formSchema>;

interface LayoutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LayoutFormValues) => void;
  initialData?: Layout | null;
}

export default function LayoutFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}: LayoutFormDialogProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState('general');
  // Add new state to track whether type has been selected
  const [hasSelectedType, setHasSelectedType] = React.useState(!!initialData);


  // Setup form with proper type handling
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: (initialData?.type as FormLayoutType) || 'claims',
      fields: initialData?.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        description: field.description,
        required: field.required,
        category: field.category,
        order: field.order,
        validation: field.validation,
        customProperties: field.customProperties || {}
      })) || []
    }
  });

  // Get available fields based on layout type
  const availableFields = React.useMemo(() => {
    const type = form.watch('type') as LayoutType;
    return getLibraryFieldsByType(type);
  }, [form.watch('type')]);

  // Convert readonly arrays to mutable arrays for categories
  const layoutCategories = React.useMemo(() => {
    const type = form.watch('type') as LayoutType;
    return [...FIELD_CATEGORIES[type]];
  }, [form.watch('type')]);

  // Generate sample data for preview
  const sampleData = React.useMemo(() => {
    const fields = form.watch('fields');
    return fields.reduce((acc, field) => {
      acc[field.name] = generateSampleDataForField(field);
      return acc;
    }, {} as Record<string, any>);
  }, [form.watch('fields')]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveDragItem(active.data?.current?.field);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.data?.current?.type === 'FIELD' && over.id === 'droppable-field-list') {
      const draggedField = active.data.current.field;

      if (isStandardField(draggedField)) {
        const currentFields = form.getValues('fields');
        const layoutField = convertFieldToLayoutField(draggedField, currentFields.length);

        form.setValue('fields', [...currentFields, layoutField], {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
    }

    if (active.data?.current?.type === 'LAYOUT_FIELD' && over.id !== active.id) {
      const oldIndex = form.getValues('fields')
        .findIndex(field => field.id === active.id);
      const newIndex = form.getValues('fields')
        .findIndex(field => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(form.getValues('fields'), oldIndex, newIndex)
          .map((field, index) => ({
            ...field,
            order: index
          }));
        form.setValue('fields', newFields);
      }
    }

    setActiveId(null);
    setActiveDragItem(null);
  };

  const handleFormSubmit = (data: FormSchema) => {
    // Convert FormSchema to LayoutFormValues
    const formValues: LayoutFormValues = {
      name: data.name,
      description: data.description,
      type: data.type as LayoutType,
      fields: data.fields
    };
    onSubmit(formValues);
  };

  const TypeSelection = () => (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Layout Type</FormLabel>
          {hasSelectedType ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-2 border rounded-md bg-muted capitalize">
                {field.value} Layout
              </div>
              {!initialData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHasSelectedType(false);
                    form.setValue('fields', []);
                  }}
                >
                  Change
                </Button>
              )}
            </div>
          ) : (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                setHasSelectedType(true);
                form.setValue('fields', []);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="claims">Claims Layout</SelectItem>
                <SelectItem value="eligibility">Eligibility Layout</SelectItem>
                <SelectItem value="wellness">Wellness Layout</SelectItem>
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{initialData ? 'Edit Layout' : 'Create New Layout'}</DialogTitle>
          <DialogDescription>
            Configure your layout structure and fields.
          </DialogDescription>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-4 border-b">
                  <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="fields">Fields</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[calc(100vh-15rem)]">
                  <div className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        <TabsContent value="general" className="mt-0">
                          <Card className="p-6">
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Layout Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter layout name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <TypeSelection />

                              <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Enter layout description"
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </Card>
                        </TabsContent>

                        <TabsContent value="fields" className="mt-0">
                          <div className="flex gap-6">
                            <ScrollArea className="w-80 border rounded-lg">
                              <FieldSelector
                                selectedType={form.watch('type')}
                                categories={layoutCategories}
                                availableFields={availableFields}
                              />
                            </ScrollArea>

                            <Card className="flex-1 p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-base">Layout Fields</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    {form.watch('fields').length} fields configured
                                  </div>
                                </div>

                                <DroppableFieldList
                                  fields={form.watch('fields')}
                                  onFieldRemove={(fieldId) => {
                                    const currentFields = form.getValues('fields')
                                      .filter(f => f.id !== fieldId);
                                    form.setValue('fields', currentFields);
                                  }}
                                  onFieldUpdate={(fieldId, updates) => {
                                    const currentFields = form.getValues('fields');
                                    const fieldIndex = currentFields
                                      .findIndex(f => f.id === fieldId);
                                    if (fieldIndex > -1) {
                                      const updatedFields = [...currentFields];
                                      updatedFields[fieldIndex] = {
                                        ...updatedFields[fieldIndex],
                                        ...updates
                                      };
                                      form.setValue('fields', updatedFields);
                                    }
                                  }}
                                />
                              </div>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                          <Card className="p-6">
                            <div className="space-y-6">
                              {/* Layout Details */}
                              <div>
                                <h3 className="text-lg font-medium mb-4">Layout Details</h3>
                                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                  <div>
                                    <p className="text-sm font-medium">Name</p>
                                    <p className="text-sm text-muted-foreground">{form.watch('name')}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      {form.watch('type')} Layout
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Description</p>
                                    <p className="text-sm text-muted-foreground">
                                      {form.watch('description')}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Fields Preview */}
                              <div>
                                <h3 className="text-lg font-medium mb-4">Fields Configuration</h3>
                                <div className="border rounded-lg">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="border-b bg-muted/50">
                                        <th className="text-left p-2 font-medium">Field Name</th>
                                        <th className="text-left p-2 font-medium">Type</th>
                                        <th className="text-left p-2 font-medium">Category</th>
                                        <th className="text-left p-2 font-medium">Required</th>
                                        <th className="text-left p-2 font-medium">Validation</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {form.watch('fields').map((field) => (
                                        <tr key={field.id} className="border-b">
                                          <td className="p-2 font-medium">{field.name}</td>
                                          <td className="p-2">{field.type}</td>
                                          <td className="p-2">{field.category}</td>
                                          <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                              ${field.required
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'}`}
                                            >
                                              {field.required ? 'Required' : 'Optional'}
                                            </span>
                                          </td>
                                          <td className="p-2">
                                            {field.validation && (
                                              <div className="text-xs space-y-1">
                                                {field.validation.pattern && (
                                                  <div>Pattern: <code className="bg-muted px-1 rounded">{field.validation.pattern}</code></div>
                                                )}
                                                {field.validation.minLength && (
                                                  <div>Min Length: {field.validation.minLength}</div>
                                                )}
                                                {field.validation.maxLength && (
                                                  <div>Max Length: {field.validation.maxLength}</div>
                                                )}
                                                {field.validation.enum && (
                                                  <div>Values: {field.validation.enum.join(', ')}</div>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Sample Data Preview */}
                              {form.watch('fields').length > 0 && (
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Sample Data Preview</h3>
                                  <div className="border rounded-lg p-4 bg-muted/50">
                                    <pre className="text-sm whitespace-pre-wrap">
                                      {JSON.stringify(sampleData, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        </TabsContent>
                      </form>
                    </Form>
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          </div>

          <DragOverlay>
            {activeId && activeDragItem && (
              <div className="flex items-center gap-2 p-2 rounded-md border bg-white shadow-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activeDragItem.name}</p>
                  <p className="text-xs text-muted-foreground">{activeDragItem.type}</p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleFormSubmit)}
            disabled={!form.formState.isValid || form.watch('fields').length === 0}
          >
            {initialData ? 'Update Layout' : 'Create Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}