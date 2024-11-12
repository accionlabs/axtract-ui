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
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Layout,
  LayoutField,
  LayoutFormValues,
  LayoutType,
  StandardField,
} from '../types';
import { FIELD_CATEGORIES } from '../mockData';
import FieldSelector from './FieldSelector';
import DroppableFieldList from './DroppableFieldList';
import { LayoutPreview } from './LayoutPreview';

// Update the validation schema to be less strict
const layoutFormFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['string', 'number', 'date', 'boolean', 'decimal']),
  description: z.string(),
  required: z.boolean(),
  category: z.string().optional(),
  order: z.number(),
  validation: z.record(z.any()).optional(),
  customProperties: z.record(z.any()).optional()
});

// Main form schema with less strict validation
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string(), // Remove min length requirement
  type: z.enum(['claims', 'eligibility', 'wellness']),
  fields: z.array(layoutFormFieldSchema)
});

type FormSchema = z.infer<typeof formSchema>;

// Updated interfaces and type definitions
interface DraggedFieldData {
  type: 'FIELD';
  field: StandardField;
}

interface DraggedLayoutFieldData {
  type: 'LAYOUT_FIELD';
  field: LayoutFormValues['fields'][0];
}

// Type guard functions
const isDraggedField = (data: any): data is DraggedFieldData => {
  return data?.type === 'FIELD';
};

const isDraggedLayoutField = (data: any): data is DraggedLayoutFieldData => {
  return data?.type === 'LAYOUT_FIELD';
};

const toMutableArray = <T,>(readonlyArray: readonly T[]): T[] => {
  return [...readonlyArray];
};

interface LayoutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LayoutFormValues) => void;
  initialData?: Layout | null;
  getAvailableFields: (type: LayoutType) => StandardField[];
}

export default function LayoutFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  getAvailableFields
}: LayoutFormDialogProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState('general');

  const defaultValues: FormSchema = {
    name: '',
    description: '',
    type: 'claims',
    fields: []
  };

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
        order: field.order,
        category: field.category || 'General',
        validation: field.validation || {},
        customProperties: field.customProperties || {}
      })) || []
    }
  });

  // Keep the memoized formFields
  const formFields = React.useMemo(() => {
    const fields = form.watch('fields');
    return fields.map((field, index) => ({
      ...field,
      id: field.id || `field-${index}`,
      order: field.order ?? index,
      category: field.category || 'General',
      customProperties: field.customProperties || {}
    }));
  }, [form.watch('fields')]);

  // Custom validation function using memoized formFields
  const isFormValid = React.useMemo(() => {
    const formName = form.watch('name');
    const formType = form.watch('type');

    if (!formName || formName.length < 2) return false;
    if (!formType) return false;
    if (formFields.length === 0) return false;

    return formFields.every(field => 
      field.name && 
      field.type &&
      field.description
    );
  }, [formFields, form.watch('name'), form.watch('type')]);

  // Watch the type field
  const selectedType = form.watch('type');
  const hasSelectedType = !!selectedType;

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description,
          type: initialData.type,
          fields: initialData.fields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type,
            description: field.description,
            required: field.required,
            order: field.order,
            category: field.category || 'General',
            validation: field.validation || {},
            customProperties: field.customProperties || {}
          }))
        });
      } else {
        form.reset(defaultValues);
      }
      setActiveTab('general');
    }
  }, [open, initialData, form.reset]);

  // Get available fields based on type
  const availableFields = React.useMemo(() => {
    const type = form.watch('type');
    return getAvailableFields(type);
  }, [form.watch('type'), getAvailableFields]);

  // Get categories for current type
  const layoutCategories = React.useMemo(() => {
    const type = form.watch('type');
    return toMutableArray(FIELD_CATEGORIES[type]);
  }, [form.watch('type')]);

  // Update form field handling
  const handleTypeChange = (value: string) => {
    form.setValue('type', value as LayoutType);
    form.setValue('fields', []); // Clear fields when type changes
  };

  const handleDialogClose = () => {
    form.reset(defaultValues);
    setActiveId(null);
    setActiveDragItem(null);
    setActiveTab('general');
    onOpenChange(false);
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveDragItem(active.data?.current?.field);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.data?.current && isDraggedField(active.data.current) && over.id === 'droppable-field-list') {
      const draggedField = active.data.current.field;
      const currentFields = form.getValues('fields');

      const formField = {
        id: `field-${Date.now()}`,
        name: draggedField.name,
        type: draggedField.type,
        description: draggedField.description,
        required: draggedField.required,
        order: currentFields.length,  // Set order to last position
        category: draggedField.category || 'General',
        validation: draggedField.validation,
        customProperties: {}
      };

      form.setValue('fields', [...currentFields, formField], {
        shouldValidate: true
      });
    }

    if (active.data?.current && isDraggedLayoutField(active.data.current)) {
      const currentFields = form.getValues('fields');
      const oldIndex = currentFields.findIndex(field => field.id === active.id);
      const newIndex = currentFields.findIndex(field => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newFields = arrayMove(currentFields, oldIndex, newIndex).map((field, index) => ({
          ...field,
          order: index  // Update order after move
        }));
        form.setValue('fields', newFields);
      }
    }

    setActiveId(null);
    setActiveDragItem(null);
  };

  const getDragOverlayContent = () => {
    if (!activeId || !activeDragItem) return null;

    return (
      <div className="flex items-center gap-2 p-2 rounded-md border bg-white shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-medium">{activeDragItem.name}</p>
          <p className="text-xs text-muted-foreground">{activeDragItem.type}</p>
        </div>
      </div>
    );
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<LayoutField>) => {
    const currentFields = form.getValues('fields');
    const fieldIndex = currentFields.findIndex(f => f.id === fieldId);

    if (fieldIndex > -1) {
      const updatedFields = [...currentFields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        ...updates,
        order: updates.order ?? updatedFields[fieldIndex].order ?? fieldIndex
      };
      form.setValue('fields', updatedFields);
    }
  };

  // Add validation state tracking
  const {
    formState: { errors }
  } = form;


  const handleSubmit = (data: FormSchema) => {
    // Ensure all fields have required properties
    const sanitizedFields = data.fields.map((field, index) => ({
      ...field,
      id: field.id || `field-${Date.now()}-${index}`,
      category: field.category || 'General',
      validation: field.validation || {},
      customProperties: field.customProperties || {}
    }));

    const formData: LayoutFormValues = {
      ...data,
      fields: sanitizedFields
    };

    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleDialogClose();
        }
      }}
    >
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <div className="px-6 pt-4 border-b">
                      <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="fields" disabled={!hasSelectedType}>
                          Fields
                        </TabsTrigger>
                        <TabsTrigger
                          value="preview"
                          disabled={!hasSelectedType || form.getValues('fields').length === 0}
                        >
                          Preview
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="general" className="h-full">
                        <ScrollArea className="h-full px-6 py-4">
                          <div className="space-y-4 max-w-2xl">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Layout Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter layout name" />
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
                                  {initialData ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="px-3 py-2 border rounded-md bg-muted capitalize">
                                        {field.value} Layout
                                      </div>
                                    </div>
                                  ) : (
                                    <Select
                                      value={field.value}
                                      onValueChange={handleTypeChange}
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

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Enter a detailed description"
                                      className="min-h-[100px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="fields" className="h-full">
                        <div className="h-full flex gap-6 p-6">
                          <div className="w-80 border rounded-lg">
                            <FieldSelector
                              selectedType={form.watch('type')}
                              categories={layoutCategories}
                              availableFields={availableFields}
                            />
                          </div>

                          <div className="flex-1">
                            <DroppableFieldList
                              fields={formFields}
                              onFieldRemove={(fieldId: string) => {
                                const currentFields = form.getValues('fields')
                                  .filter(f => f.id !== fieldId)
                                  .map((field, index) => ({
                                    ...field,
                                    order: index  // Reorder remaining fields
                                  }));
                                form.setValue('fields', currentFields);
                              }}
                              onFieldUpdate={handleFieldUpdate}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="preview" className="mt-0 h-full">
                        <LayoutPreview
                          name={form.watch('name')}
                          description={form.watch('description')}
                          type={form.watch('type')}
                          status={initialData?.status}
                          fields={formFields}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </form>
              </Form>
            </div>
          </div>

          <DragOverlay>
            {getDragOverlayContent()}
          </DragOverlay>
        </DndContext>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!isFormValid}
          >
            {initialData ? 'Update Layout' : 'Create Layout'}
          </Button>

          {/* Add error feedback if needed */}
          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please fill in all required fields correctly
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}