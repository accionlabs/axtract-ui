// src/features/source-manager/components/forms/DatabaseConfigForm.tsx

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOURCE_CONFIG, DatabaseType, DatabaseConfig } from '../../types';
import { FormValues } from '../../schemas/form-schemas';

interface DatabaseConfigFormProps {
  form: UseFormReturn<FormValues>;
  initialData?: DatabaseConfig;
  disabled?: boolean;
}

export default function DatabaseConfigForm({ form, initialData, disabled }: DatabaseConfigFormProps) {
  // Handle type change internally with proper type safety
  const handleTypeChange = (type: DatabaseType) => {
    form.setValue('database.type', type);
    form.setValue('database.port', SOURCE_CONFIG.database.defaultPorts[type]);
    form.setValue('database.schema', SOURCE_CONFIG.database.defaultSchemas[type]);
  };

  // Set initial values when component mounts
  React.useEffect(() => {
    if (initialData) {
      form.setValue('database.type', initialData.type);
      form.setValue('database.host', initialData.host);
      form.setValue('database.port', initialData.port);
      form.setValue('database.database', initialData.database);
      form.setValue('database.schema', initialData.schema);
      form.setValue('database.username', initialData.username);
      form.setValue('database.password', initialData.password);
    }
  }, [initialData, form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="database.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Database Type</FormLabel>
            <Select
              onValueChange={(value: DatabaseType) => handleTypeChange(value)}
              value={field.value}
              disabled={disabled || !!initialData} // Disable if editing existing source
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select your database system type
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="database.host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="localhost or hostname" 
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="database.port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))} 
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="database.database"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="database.schema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schema</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="database.username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="database.password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field} 
                  disabled={disabled}
                  placeholder={initialData ? '••••••••' : undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}