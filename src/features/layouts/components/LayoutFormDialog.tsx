// src/features/layoutManager/components/LayoutFormDialog.tsx
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

// Types and Components
import { 
  Layout, 
  LayoutField, 
  LayoutType, 
  StandardField, 
  LayoutFormValues,
  LayoutFormField,
  FieldType 
} from '@/features/layouts/types';
import FieldSelector from './FieldSelector';
import DroppableFieldList from './DroppableFieldList';

// Constants
const LAYOUT_TYPES = [
  { value: 'claims', label: 'Claims Layout' },
  { value: 'wellness', label: 'Wellness Layout' },
  { value: 'eligibility', label: 'Eligibility Layout' }
] as const;

// Define the field types literal for Zod
const fieldTypes = ['string', 'number', 'date', 'boolean', 'decimal'] as const;

// Create form schema matching LayoutFormValues type
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['claims', 'wellness', 'eligibility'] as const),
  fields: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Field name is required'),
    type: z.enum(fieldTypes),
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

type FormSchema = z.infer<typeof formSchema>;

interface LayoutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LayoutFormValues) => void;
  initialData?: Layout;
}

export default function LayoutFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}: LayoutFormDialogProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = React.useState<any>(null);

  // Initialize form with proper types
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'claims',
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

  // Configure DND sensors
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

    // Handle dropping a new field from the library
    if (active.data?.current?.type === 'FIELD' && over.id === 'droppable-field-list') {
      const newField = active.data.current.field as StandardField;
      const currentFields = form.getValues('fields');
      
      // Create new layout field
      const layoutField: LayoutFormField = {
        id: `field-${Date.now()}-${currentFields.length}`,
        name: newField.name,
        type: newField.type,
        description: newField.description,
        required: newField.required,
        category: newField.category,
        order: currentFields.length,
        validation: newField.validation,
        customProperties: {}
      };

      // Update the form fields
      const updatedFields = [...currentFields, layoutField];
      form.setValue('fields', updatedFields, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    }

    // Handle reordering existing fields
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

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveDragItem(null);
  };

  // Handle field removal
  const handleFieldRemove = (fieldId: string) => {
    const currentFields = form.getValues('fields').filter(field => field.id !== fieldId);
    form.setValue('fields', currentFields.map((field, index) => ({ ...field, order: index })));
  };

  // Handle field updates
  const handleFieldUpdate = (fieldId: string, updates: Partial<LayoutField>) => {
    const currentFields = form.getValues('fields');
    const fieldIndex = currentFields.findIndex(field => field.id === fieldId);

    if (fieldIndex > -1) {
      const updatedFields = [...currentFields];
      updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...updates };
      form.setValue('fields', updatedFields);
    }
  };

  const handleSubmit = (data: FormSchema) => {
    const formValues: LayoutFormValues = {
      name: data.name,
      description: data.description,
      type: data.type,
      fields: data.fields
    };
    onSubmit(formValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{initialData ? 'Edit Layout' : 'Create New Layout'}</DialogTitle>
          <DialogDescription>
            Configure your layout structure and fields. Drag fields from the library on the left to add them to your layout.
          </DialogDescription>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex-1 flex overflow-hidden">
            {/* Field Library Sidebar */}
            <ScrollArea className="w-80 border-r">
              <FieldSelector
                selectedType={form.watch('type')}
                onTypeChange={(type) => form.setValue('type', type)}
              />
            </ScrollArea>

            {/* Main Form Area */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="general" className="w-full">
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
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <TabsContent value="general" className="space-y-6 mt-0">
                          <Card className="p-6">
                            <div className="grid grid-cols-2 gap-6">
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

                              <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Layout Type</FormLabel>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select layout type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="claims">Claims Layout</SelectItem>
                                        <SelectItem value="wellness">Wellness Layout</SelectItem>
                                        <SelectItem value="eligibility">Eligibility Layout</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem className="mt-6">
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
                          </Card>
                        </TabsContent>

                        <TabsContent value="fields" className="mt-0">
                          <Card className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-base">Layout Fields</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  {form.watch('fields').length} fields configured
                                </div>
                              </div>

                              <DroppableFieldList
                                id="droppable-layout-fields"
                                fields={form.watch('fields')}
                                onFieldRemove={handleFieldRemove}
                                onFieldUpdate={handleFieldUpdate}
                              />
                            </div>
                          </Card>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                          <Card className="p-6">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Layout Preview</h3>
                              <div className="border rounded-lg p-4">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2">Field Name</th>
                                      <th className="text-left p-2">Type</th>
                                      <th className="text-left p-2">Required</th>
                                      <th className="text-left p-2">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {form.watch('fields').map((field, index) => (
                                      <tr key={field.id} className="border-b">
                                        <td className="p-2">{field.name}</td>
                                        <td className="p-2">{field.type}</td>
                                        <td className="p-2">{field.required ? 'Yes' : 'No'}</td>
                                        <td className="p-2">{field.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
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

          {/* Drag Overlay */}
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
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!form.formState.isValid}
          >
            {initialData ? 'Update Layout' : 'Create Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}