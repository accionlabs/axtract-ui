// src/features/files/components/tabs/BasicConfigTab.tsx

import { useAppState } from '@/context/AppStateContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import { FormSchema } from '../FileFormDialog';

interface BasicConfigTabProps {
  form: UseFormReturn<FormSchema>;
}

export function BasicConfigTab({ form }: BasicConfigTabProps) {
  // Get layouts from AppState
  const { state: { layouts } } = useAppState();

  // Filter for active layouts only
  const activeLayouts = layouts.filter(layout => layout.status === 'active');

  // Get the currently selected layout
  const selectedLayout = layouts.find(l => l.id === form.watch('layoutId'));
  
  // Get current format value
  const currentFormat = form.watch('format');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter a descriptive name for this file" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="layoutId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layout</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an active layout" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeLayouts.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No active layouts available. Please activate a layout first.
                    </div>
                  ) : (
                    activeLayouts.map(layout => (
                      <SelectItem 
                        key={layout.id} 
                        value={layout.id}
                      >
                        <div className="flex items-center gap-2">
                          <span>{layout.name}</span>
                          <Badge variant="outline" className="capitalize">
                            {layout.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedLayout && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {selectedLayout.fields.length} fields configured
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="outline">
                      {selectedLayout.fields.filter(f => f.required).length} required fields
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {selectedLayout.description}
                  </p>
                </div>
              )}
              {layouts.length > 0 && activeLayouts.length === 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      No active layouts available
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>All layouts are currently in draft or inactive state.</p>
                      <p>Activate a layout in the Layout Manager to use it here.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CSV">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="TSV">TSV (Tab Separated)</SelectItem>
                  <SelectItem value="FIXED">Fixed Length</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedLayout && currentFormat === 'FIXED' && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              Fixed length format selected. Each field in the layout has predefined widths that must be respected.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}