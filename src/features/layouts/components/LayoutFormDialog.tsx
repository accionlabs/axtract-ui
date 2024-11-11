// src/features/layouts/components/LayoutFormDialog.tsx
import { useState,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout, LayoutFormValues } from '../types';
import { useAppState } from '@/context/AppStateContext';

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
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import LayoutFieldConfiguration from './LayoutFieldConfiguration';

// Validation schema for single field
const fieldValidationSchema = z.object({
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  precision: z.number().optional(),
  enum: z.array(z.string()).optional()
});

// Validation schema for layout field
const layoutFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['string', 'number', 'date', 'boolean', 'decimal'] as const),
  description: z.string(),
  required: z.boolean(),
  category: z.string(),
  validation: fieldValidationSchema.optional(),
  customProperties: z.record(z.any()).optional()
});

// Main form schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['claims', 'eligibility', 'wellness'] as const),
  fields: z.array(layoutFieldSchema)
});

type FormValues = z.infer<typeof formSchema>;

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
  const { state: { layouts } } = useAppState();
  const [activeTab, setActiveTab] = useState('general');

  const form = useForm<FormValues>({
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
        category: field.category || 'General',
        validation: field.validation || {},
        customProperties: field.customProperties || {}
      })) || []
    }
  });

  // Watch form values for validation
  //const formType = form.watch('type');
  const formFields = form.watch('fields');

  // Validation function
  const validateForm = (values: FormValues): boolean => {
    // Check for duplicate layout names
    const existingLayout = layouts.find(
      l => l.name.toLowerCase() === values.name.toLowerCase() && 
          l.id !== initialData?.id
    );

    if (existingLayout) {
      form.setError('name', {
        type: 'manual',
        message: 'A layout with this name already exists'
      });
      return false;
    }

    // Check for required fields in claims layouts
    if (values.type === 'claims' && !values.fields.some(f => f.required)) {
      form.setError('fields', {
        type: 'manual',
        message: 'Claims layouts must have at least one required field'
      });
      return false;
    }

    // Check for minimum fields
    if (values.fields.length === 0) {
      form.setError('fields', {
        type: 'manual',
        message: 'Layout must have at least one field'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (values: FormValues) => {
    if (!validateForm(values)) return;
    onSubmit(values);
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || 'claims',
        fields: initialData?.fields.map(field => ({
          id: field.id,
          name: field.name,
          type: field.type,
          description: field.description,
          required: field.required,
          category: field.category || 'General',
          validation: field.validation || {},
          customProperties: field.customProperties || {}
        })) || []
      });
      setActiveTab('general');
    }
  }, [open, initialData, form.reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {initialData ? 'Edit Layout' : 'Create New Layout'}
          </DialogTitle>
          <DialogDescription>
            Configure your layout structure and fields.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-6 border-b">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="fields" disabled={!form.getValues('type')}>
                    Fields
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    disabled={!form.getValues('type') || formFields.length === 0}
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
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
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!!initialData}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="claims">Claims Layout</SelectItem>
                                  <SelectItem value="eligibility">Eligibility Layout</SelectItem>
                                  <SelectItem value="wellness">Wellness Layout</SelectItem>
                                </SelectContent>
                              </Select>
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
                                  placeholder="Enter a detailed description of this layout"
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
                    <LayoutFieldConfiguration />
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    <Card className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Layout Preview</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Field Name</th>
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Category</th>
                                <th className="text-left p-2">Required</th>
                                <th className="text-left p-2">Validation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {formFields.map((field, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2">{field.name}</td>
                                  <td className="p-2">{field.type}</td>
                                  <td className="p-2">{field.category}</td>
                                  <td className="p-2">{field.required ? 'Yes' : 'No'}</td>
                                  <td className="p-2">
                                    {field.validation && Object.entries(field.validation)
                                      .filter(([_, value]) => value !== undefined)
                                      .map(([key, value]) => (
                                        <div key={key} className="text-sm">
                                          {key}: {value}
                                        </div>
                                      ))
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="p-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || formFields.length === 0}
              >
                {initialData ? 'Update Layout' : 'Create Layout'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}