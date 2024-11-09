import { Layout } from '../types';
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
import { Edit, Trash2, MoreHorizontal, Eye, FileDown } from 'lucide-react';

interface LayoutListProps {
  layouts: Layout[];
  onEdit: (layout: Layout) => void;
  onDelete: (layout: Layout) => void;
  onStatusChange: (layoutId: string, newStatus: 'draft' | 'pending' | 'active') => void;
}

export default function LayoutList({ 
  layouts, 
  onEdit, 
  onDelete,
  onStatusChange 
}: LayoutListProps) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Layout List</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              Import Layout
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {layouts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No layouts found. Create your first layout to get started.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {layouts.map((layout) => (
                  <TableRow key={layout.id}>
                    <TableCell className="font-medium">{layout.name}</TableCell>
                    <TableCell className="capitalize">{layout.type}</TableCell>
                    <TableCell>v{layout.version}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(layout.status)}`}
                      >
                        {layout.status.charAt(0).toUpperCase() + layout.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{layout.fields.length} fields</TableCell>
                    <TableCell>{formatDate(layout.lastModified)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onEdit(layout)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Layout
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportLayout(layout)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {layout.status !== 'active' && (
                            <DropdownMenuItem 
                              onClick={() => onStatusChange(layout.id, 'active')}
                              className="text-green-600"
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                          {layout.status !== 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => onStatusChange(layout.id, 'pending')}
                              className="text-yellow-600"
                            >
                              Mark as Pending
                            </DropdownMenuItem>
                          )}
                          {layout.status !== 'draft' && (
                            <DropdownMenuItem 
                              onClick={() => onStatusChange(layout.id, 'draft')}
                              className="text-gray-600"
                            >
                              Return to Draft
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(layout)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}