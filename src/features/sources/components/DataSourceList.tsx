// src/features/sources/components/DataSourceList.tsx

// import React from 'react';
import { DataSource } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Database,
  FileText,
  Globe,
  AlertCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface DataSourceListProps {
  sources: DataSource[];
  onEdit: (source: DataSource) => void;
  onDelete: (source: DataSource) => void;
  onTest: (sourceId: string) => void;
}

export default function DataSourceList({ 
  sources, 
  onEdit, 
  onDelete, 
  onTest 
}: DataSourceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'configuring':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'api':
        return <Globe className="h-4 w-4" />;
      default:
        return null;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Last Tested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getSourceIcon(source.type)}
                    <div>
                      <div className="font-medium">{source.name}</div>
                      {source.description && (
                        <div className="text-sm text-muted-foreground">
                          {source.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{source.type}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(source.status)}>
                    {source.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(source.updatedAt)}</TableCell>
                <TableCell>
                  {source.lastTestAt ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-2">
                            {source.status === 'error' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {formatDate(source.lastTestAt)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Last test: {source.status === 'error' ? 'Failed' : 'Successful'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground">Never tested</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(source)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Source
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTest(source.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test Connection
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(source)}
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
            {sources.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No data sources configured. Create your first source to get started.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}