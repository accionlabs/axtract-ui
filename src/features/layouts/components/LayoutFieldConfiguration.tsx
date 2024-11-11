// src/features/layouts/components/LayoutFieldConfiguration.tsx

import { useFieldArray, useFormContext } from 'react-hook-form';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, Plus, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FieldType, LayoutFormField } from '../types';

type FormValues = {
  type: string;
  fields: LayoutFormField[];
};

const fieldTypes: { label: string; value: FieldType; }[] = [
  { label: 'Text', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Decimal', value: 'decimal' }
];

const defaultCategories = [
  'General',
  'Member Information',
  'Provider Information',
  'Claim Information',
  'Financial Information',
  'Coverage Information',
  'Plan Information',
  'Other'
];

export default function LayoutFieldConfiguration() {
  const { control, formState: { errors } } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  const fieldsArray = fields as unknown as LayoutFormField[];

  const handleAddField = () => {
    append({
      name: '',
      type: 'string',
      description: '',
      required: false,
      category: 'General',
      validation: {},
      customProperties: {}
    });
  };

  const validateFieldName = (value: string, index: number) => {
    const duplicate = fieldsArray.some(
      (field, i) => i !== index && field.name.toLowerCase() === value.toLowerCase()
    );
    return !duplicate || 'Field name must be unique';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Fields Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure the fields for your layout
          </p>
        </div>
        <Button onClick={handleAddField} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {fieldsArray.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <DragHandleDots2Icon className="h-8 w-8 mb-2" />
              <p>No fields configured</p>
              <p className="text-sm">Add fields to your layout by clicking the button above</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {fieldsArray.map((field, index) => (
            <AccordionItem
              key={field.id || index}
              value={field.id || index.toString()}
              className={cn(
                "border rounded-md",
                errors?.fields?.[index] && "border-red-500"
              )}
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2 flex-1">
                  <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {field.name || 'New Field'}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {field.type}
                  </Badge>
                  {field.required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                  {errors?.fields?.[index] && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This field has validation errors</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="space-y-4">
                  {/* Basic Field Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Field Name</Label>
                      <Input
                        {...control.register(`fields.${index}.name`, {
                          required: 'Field name is required',
                          validate: value => validateFieldName(value, index)
                        })}
                        placeholder="Enter field name"
                      />
                      {errors?.fields?.[index]?.name && (
                        <p className="text-xs text-red-500">
                          {errors.fields[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: FieldType) => {
                          control.register(`fields.${index}.type`).onChange({
                            target: { value }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      {...control.register(`fields.${index}.description`)}
                      placeholder="Enter field description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={field.category || 'General'}
                      onValueChange={(value: string) => {
                        control.register(`fields.${index}.category`).onChange({
                          target: { value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Field Properties */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked: boolean) => {
                          control.register(`fields.${index}.required`).onChange({
                            target: { value: checked }
                          });
                        }}
                      />
                      <Label>Required Field</Label>
                    </div>
                  </div>

                  {/* Type-specific Validation Rules */}
                  {field.type === 'string' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Minimum Length</Label>
                        <Input
                          type="number"
                          {...control.register(`fields.${index}.validation.minLength`, {
                            valueAsNumber: true
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum Length</Label>
                        <Input
                          type="number"
                          {...control.register(`fields.${index}.validation.maxLength`, {
                            valueAsNumber: true
                          })}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Pattern (regex)</Label>
                        <Input
                          {...control.register(`fields.${index}.validation.pattern`)}
                          placeholder="e.g. ^[A-Za-z0-9]+$"
                        />
                      </div>
                    </div>
                  )}

                  {(field.type === 'number' || field.type === 'decimal') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Minimum Value</Label>
                        <Input
                          type="number"
                          {...control.register(`fields.${index}.validation.min`, {
                            valueAsNumber: true
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum Value</Label>
                        <Input
                          type="number"
                          {...control.register(`fields.${index}.validation.max`, {
                            valueAsNumber: true
                          })}
                        />
                      </div>
                      {field.type === 'decimal' && (
                        <div className="space-y-2">
                          <Label>Decimal Precision</Label>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            {...control.register(`fields.${index}.validation.precision`, {
                              valueAsNumber: true
                            })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove Field
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {errors?.fields && (
        <p className="text-sm text-red-500 mt-2">
          Please fix the errors in your field configuration
        </p>
      )}
    </div>
  );
}