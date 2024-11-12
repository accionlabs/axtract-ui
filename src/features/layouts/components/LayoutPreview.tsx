// src/features/layouts/components/LayoutPreview.tsx

//import React from 'react';
import { Layout, LayoutField } from '../types';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { generateSampleDataForField } from '../mockData';

interface LayoutPreviewProps {
  name: string;
  description: string;
  type: Layout['type'];
  status?: Layout['status'];
  fields: LayoutField[];
}

export function LayoutPreview({
  name,
  description,
  type,
  status,
  fields
}: LayoutPreviewProps) {
  return (
    <ScrollArea className="h-full p-6">
      <div className="space-y-6 max-w-4xl">
        {/* Layout Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Layout Details</h3>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                <p className="mt-1">{name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {type} Layout
                  </Badge>
                  {status && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        status === 'active' && "bg-green-100 text-green-800",
                        status === 'draft' && "bg-gray-100 text-gray-800",
                        status === 'pending' && "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {status}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1 text-sm">{description}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Fields Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Fields Configuration</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {fields.length} Fields
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {fields.filter(f => f.required).length} Required
              </Badge>
            </div>
          </div>
          
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead className="w-[100px]">Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {field.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {field.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {field.category || 'General'}
                    </TableCell>
                    <TableCell>
                      {field.required ? (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {field.validation && Object.keys(field.validation).length > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary">
                                {Object.keys(field.validation).length} Rules
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs space-y-1">
                                {Object.entries(field.validation).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium capitalize">{key}:</span>{" "}
                                    {Array.isArray(value) ? value.join(', ') : value.toString()}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-sm text-muted-foreground">No validation</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {field.order + 1}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Sample Data Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sample Data Preview</h3>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">JSON Format</Badge>
                <span className="text-sm text-muted-foreground">
                  Sample row with dummy data
                </span>
              </div>
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                  {JSON.stringify(
                    fields.reduce((acc, field) => {
                      acc[field.name] = generateSampleDataForField(field);
                      return acc;
                    }, {} as Record<string, any>),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </Card>
        </div>

        {/* Validation Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Validation Summary</h3>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {fields.filter(f => !!(f.validation && Object.keys(f.validation).length)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fields with Validation
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {fields.filter(f => f.required).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Required Fields
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {fields.reduce((acc, field) => 
                      acc + (field.validation ? Object.keys(field.validation).length : 0), 
                    0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Validation Rules
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(fields.reduce((acc, field) => {
                      if (field.category) acc[field.category] = true;
                      return acc;
                    }, {} as Record<string, boolean>)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Field Categories
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}