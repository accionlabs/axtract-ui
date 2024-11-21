// @/features/sources/components/DataSourceConfiguration.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  Database as DatabaseIcon, 
  FileText, 
  Globe,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  DataSource, 
  DataSourceType, 
  DatabaseType,
  DatabaseConfig,
  FileConfig,
  ApiConfig,
  SOURCE_CONFIG 
} from '../types';
import { formSchema, FormValues } from '../schemas/form-schemas';
import DatabaseConfigForm from './forms/DatabaseConfigForm';
import FileConfigForm from './forms/FileConfigForm';
import ApiConfigForm from './forms/ApiConfigForm';
import { DEFAULT_DATABASE_CONFIG, DEFAULT_FILE_CONFIG, DEFAULT_API_CONFIG } from '../config/default';

interface DataSourceConfigurationProps {
  initialData?: DataSource | null;
  onSubmit: (source: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function DataSourceConfiguration({
  initialData,
  onSubmit,
  onCancel
}: DataSourceConfigurationProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastTestResult, setLastTestResult] = React.useState<'success' | 'error' | null>(
    initialData?.status === 'active' ? 'success' : null
  );

  // Get initial values based on data source type
  const getInitialValues = React.useCallback(() => {
    if (!initialData) {
      return {
        name: '',
        description: '',
        type: 'database' as const,
        database: DEFAULT_DATABASE_CONFIG,
      };
    }

    // Set the appropriate configuration based on the source type
    switch (initialData.type) {
      case 'database':
        return {
          name: initialData.name,
          description: initialData.description || '',
          type: initialData.type,
          database: initialData.connectionDetails as DatabaseConfig
        };
      case 'file':
        return {
          name: initialData.name,
          description: initialData.description || '',
          type: initialData.type,
          file: initialData.connectionDetails as FileConfig
        };
      case 'api':
        return {
          name: initialData.name,
          description: initialData.description || '',
          type: initialData.type,
          api: initialData.connectionDetails as ApiConfig
        };
    }
  }, [initialData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues()
  });

  const selectedType = form.watch('type');

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(getInitialValues());
    }
  }, [initialData, form, getInitialValues]);

  // Handle type change with proper type safety
  const handleTypeChange = React.useCallback((newType: DataSourceType) => {
    if (newType === form.getValues('type')) return;

    const baseValues = {
      name: form.getValues('name'),
      description: form.getValues('description'),
    };

    switch (newType) {
      case 'database':
        const defaultDbType: DatabaseType = 'postgresql';
        form.reset({
          ...baseValues,
          type: newType,
          database: {
            ...DEFAULT_DATABASE_CONFIG,
            type: defaultDbType,
            port: SOURCE_CONFIG.database.defaultPorts[defaultDbType],
            schema: SOURCE_CONFIG.database.defaultSchemas[defaultDbType]
          }
        });
        break;
      case 'file':
        form.reset({
          ...baseValues,
          type: newType,
          file: DEFAULT_FILE_CONFIG
        });
        break;
      case 'api':
        form.reset({
          ...baseValues,
          type: newType,
          api: DEFAULT_API_CONFIG
        });
        break;
    }
    
    setLastTestResult(null);
  }, [form]);

  const handleTestConnection = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastTestResult(Math.random() > 0.3 ? 'success' : 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (data: FormValues) => {
    const connectionDetails = data.type === 'database' ? data.database :
                            data.type === 'file' ? data.file :
                            data.api;

    const source: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      description: data.description,
      type: data.type,
      status: lastTestResult === 'success' ? 'active' : 'configuring',
      connectionDetails,
      lastTestAt: lastTestResult ? new Date().toISOString() : undefined
    };

    onSubmit(source);
  };

  const renderSourceTypeIcon = (type: DataSourceType) => {
    switch (type) {
      case 'database':
        return <DatabaseIcon className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'api':
        return <Globe className="h-4 w-4" />;
    }
  };

  const renderConfigForm = () => {
    switch (selectedType) {
      case 'database':
        return (
          <DatabaseConfigForm 
            form={form} 
            initialData={initialData?.type === 'database' ? initialData.connectionDetails as DatabaseConfig : undefined}
            disabled={isLoading}
          />
        );
      case 'file':
        return (
          <FileConfigForm 
            form={form} 
            initialData={initialData?.type === 'file' ? initialData.connectionDetails as FileConfig : undefined}
            disabled={isLoading}
          />
        );
      case 'api':
        return (
          <ApiConfigForm 
            form={form} 
            initialData={initialData?.type === 'api' ? initialData.connectionDetails as ApiConfig : undefined}
            disabled={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter a name" 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Brief description" 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Source Type Selection */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Type</FormLabel>
                <Select
                  onValueChange={(value: DataSourceType) => handleTypeChange(value)}
                  value={field.value}
                  disabled={isLoading || !!initialData} // Disable type change for existing sources
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source type">
                        <div className="flex items-center gap-2">
                          {renderSourceTypeIcon(field.value as DataSourceType)}
                          <span className="capitalize">{field.value} Source</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="database">
                      <div className="flex items-center gap-2">
                        <DatabaseIcon className="h-4 w-4" />
                        Database Source
                      </div>
                    </SelectItem>
                    <SelectItem value="file">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        File Source
                      </div>
                    </SelectItem>
                    <SelectItem value="api">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        API Source
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Source Configuration Form */}
        <div className="border rounded-lg p-6">
          {renderConfigForm()}
        </div>

        {/* Test Results */}
        {lastTestResult === 'error' && (
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Connection failed. Please verify your credentials and try again.</p>
          </div>
        )}

        {lastTestResult === 'success' && (
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm">Connection successful! You can now save the configuration.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="secondary"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || lastTestResult !== 'success'}
          >
            {initialData ? 'Update Source' : 'Create Source'}
          </Button>
        </div>
      </form>
    </Form>
  );
}