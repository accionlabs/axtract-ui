import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SOURCE_CONFIG, FileConfig } from '../../types';
import { FormValues } from '../../schemas/form-schemas';

interface FileConfigFormProps {
  form: UseFormReturn<FormValues>;
  initialData?: FileConfig;
  disabled?: boolean;
}

export default function FileConfigForm({ form, initialData, disabled }: FileConfigFormProps) {
  // Set initial values when component mounts
  React.useEffect(() => {
    if (initialData) {
      form.setValue('file.type', initialData.type);
      form.setValue('file.location', initialData.location);
      form.setValue('file.delimiter', initialData.delimiter);
      form.setValue('file.encoding', initialData.encoding || 'UTF-8');
      form.setValue('file.hasHeader', initialData.hasHeader);
    }
  }, [initialData, form]);

  return (
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="file.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>File Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled || !!initialData}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="file.location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>File Location</FormLabel>
            <FormControl>
              <Input {...field} placeholder="/path/to/files" disabled={disabled} />
            </FormControl>
            <FormDescription>
              Enter the full path to your file or directory
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('file.type') === 'csv' && (
        <>
          <FormField
            control={form.control}
            name="file.delimiter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delimiter</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue=","
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delimiter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                    <SelectItem value="\t">Tab (\t)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file.hasHeader"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Has Header Row</FormLabel>
                  <FormDescription>
                    First row contains column names
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="file.encoding"
        render={({ field }) => (
          <FormItem>
            <FormLabel>File Encoding</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue="UTF-8"
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select encoding" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SOURCE_CONFIG.file.supportedEncodings.map(encoding => (
                  <SelectItem key={encoding} value={encoding}>
                    {encoding}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}