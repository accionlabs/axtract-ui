// src/features/layouts/components/LayoutList.tsx

import { Layout, LayoutStatus } from '../types';
import { useAppState } from '@/context/AppStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  FileDown,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayoutListProps {
  layouts: Layout[];
  onEdit: (layout: Layout) => void;
  onDelete: (layout: Layout) => void;
  onStatusChange: (layoutId: string, newStatus: LayoutStatus) => void;
}

export default function LayoutList({
  layouts,
  onEdit,
  onDelete,
  onStatusChange
}: LayoutListProps) {
  const { state: { files } } = useAppState();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportLayout = (layout: Layout) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${layout.name.toLowerCase().replace(/\s+/g, '-')}-v${layout.version}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Get files using a layout
  const getLayoutUsage = (layoutId: string) => {
    return files.filter(file => file.layoutId === layoutId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout List</CardTitle>
      </CardHeader>
      <CardContent>
        {layouts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No layouts found. Create your first layout to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {layouts.map((layout) => {
                const layoutFiles = getLayoutUsage(layout.id);
                const hasActiveFiles = layoutFiles.some(f => f.status === 'active');

                return (
                  <TableRow key={layout.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{layout.name}</span>
                        {hasActiveFiles && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                This layout is being used by active files
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{layout.type}</TableCell>
                    <TableCell>v{layout.version}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(layout.status)}
                      >
                        {layout.status.charAt(0).toUpperCase() + layout.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {layout.fields.length} fields
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p>Required: {layout.fields.filter(f => f.required).length}</p>
                              <p>Optional: {layout.fields.filter(f => !f.required).length}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {layoutFiles.length} files
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p>Active: {layoutFiles.filter(f => f.status === 'active').length}</p>
                              <p>Draft: {layoutFiles.filter(f => f.status === 'draft').length}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{formatDate(layout.lastModified)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem onClick={() => onEdit(layout)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Layout
                          </DropdownMenuItem>
                          // Continuing from previous LayoutList.tsx file...

                          <DropdownMenuItem onClick={() => handleExportLayout(layout)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export JSON
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Fields
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {layout.status !== 'active' && !hasActiveFiles && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(layout.id, 'active')}
                              className="text-green-600"
                            >
                              Activate
                              {layout.fields.length === 0 && (
                                <span className="text-xs ml-2 text-muted-foreground">
                                  (Needs fields)
                                </span>
                              )}
                            </DropdownMenuItem>
                          )}

                          {layout.status !== 'pending' && !hasActiveFiles && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(layout.id, 'pending')}
                              className="text-yellow-600"
                            >
                              Mark as Pending
                            </DropdownMenuItem>
                          )}

                          {layout.status !== 'draft' && !hasActiveFiles && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(layout.id, 'draft')}
                              className="text-gray-600"
                            >
                              Return to Draft
                            </DropdownMenuItem>
                          )}

                          {hasActiveFiles && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Status changes locked
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Deactivate all files using this layout first</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(layout)}
                            className="text-red-600"
                            disabled={hasActiveFiles || layout.status === 'active'}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                            {hasActiveFiles && (
                              <span className="text-xs ml-2 text-muted-foreground">
                                (Has active files)
                              </span>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}