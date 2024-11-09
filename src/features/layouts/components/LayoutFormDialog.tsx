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
  DragStartEvent,
  DragOverlay
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

// Import data and types
import {
  getLibraryFieldsByType,
  generateSampleDataForField,
  FIELD_CATEGORIES
} from '../mockData';
import {
  Layout,
  LayoutField,
  LayoutFormValues,
  LayoutFormField,
  LayoutType,
  StandardField
} from '../types';

import FieldSelector from './FieldSelector';
import DroppableFieldList from './DroppableFieldList';

// Field Validation Schema
const validationSchema = z.object({
  required: z.boolean().optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  precision: z.number().optional(),
  enum: z.array(z.string()).optional()
}).optional();

// Layout Form Field Schema (matches LayoutFormField)
const layoutFormFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['string', 'number', 'date', 'boolean', 'decimal']),
  description: z.string(),
  required: z.boolean(),
  category: z.string().optional(),
  validation: validationSchema,
  customProperties: z.record(z.any()).optional()
});


// Form Schema (matches LayoutFormValues)
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['claims', 'eligibility', 'wellness']),
  fields: z.array(layoutFormFieldSchema) // Using LayoutFormField schema here, not LayoutField
});

type FormSchema = z.infer<typeof formSchema>;


// Add this helper function at the top with other helpers
const convertToLayoutField = (formField: z.infer<typeof layoutFormFieldSchema>, order: number): LayoutField => ({
  id: formField.id || `field-${Date.now()}`,
  name: formField.name,
  type: formField.type,
  description: formField.description,
  required: formField.required,
  category: formField.category || 'General',
  order,
  validation: formField.validation,
  customProperties: formField.customProperties || {}
});

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
  const [hasSelectedType, setHasSelectedType] = React.useState(!!initialData);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: (initialData?.type as LayoutType) || 'claims',
      fields: initialData?.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        description: field.description,
        required: field.required,
        category: field.category,
        validation: field.validation,
        customProperties: field.customProperties
      })) || []
    }
  });

  // Get available fields based on layout type
  const availableFields = React.useMemo(() => {
    const type = form.watch('type') as LayoutType;
    return getLibraryFieldsByType(type);
  }, [form.watch('type')]);

  // Get categories for current layout type
  const layoutCategories = React.useMemo(() => {
    const type = form.watch('type') as LayoutType;
    return [...FIELD_CATEGORIES[type]];
  }, [form.watch('type')]);

  const sampleData = React.useMemo(() => {
    const formFields = form.watch('fields');
    return formFields.reduce((acc, field, index) => {
      // Convert the form field to a layout field before generating sample data
      const layoutField = convertToLayoutField(field, index);
      acc[field.name] = generateSampleDataForField(layoutField);
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
      const draggedField = active.data.current.field as StandardField;
      const currentFields = form.getValues('fields');

      const formField: LayoutFormField = {
        id: `field-${Date.now()}`,
        name: draggedField.name,
        type: draggedField.type,
        description: draggedField.description,
        required: draggedField.required,
        category: draggedField.category || 'General',
        validation: draggedField.validation,
        customProperties: {}
      };

      form.setValue('fields', [...currentFields, formField], {
        shouldValidate: true
      });
    }

    if (active.data?.current?.type === 'LAYOUT_FIELD' && over.id !== active.id) {
      const oldIndex = form.getValues('fields')
        .findIndex(field => field.id === active.id);
      const newIndex = form.getValues('fields')
        .findIndex(field => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(form.getValues('fields'), oldIndex, newIndex);
        form.setValue('fields', newFields);
      }
    }

    setActiveId(null);
    setActiveDragItem(null);
  };

  const handleFormSubmit = (data: FormSchema) => {
    onSubmit({
      name: data.name,
      description: data.description,
      type: data.type,
      fields: data.fields
    });
  };

  // Layout type selection component
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
                                  fields={form.watch('fields').map((field, index) => convertToLayoutField(field, index))}
                                  onFieldRemove={(fieldId) => {
                                    const currentFields = form.getValues('fields')
                                      .filter(f => f.id !== fieldId)
                                      .map((field) => ({
                                        ...field,
                                        category: field.category || 'General',
                                        customProperties: field.customProperties || {}
                                      }));
                                    form.setValue('fields', currentFields);
                                  }}
                                  onFieldUpdate={(fieldId, updates) => {
                                    const currentFields = form.getValues('fields');
                                    const fieldIndex = currentFields.findIndex(f => f.id === fieldId);
                                    if (fieldIndex > -1) {
                                      const updatedFields = [...currentFields];
                                      const currentField = updatedFields[fieldIndex];
                                      updatedFields[fieldIndex] = {
                                        ...currentField,
                                        ...updates,
                                        category: updates.category || currentField.category || 'General',
                                        customProperties: updates.customProperties || currentField.customProperties || {},
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