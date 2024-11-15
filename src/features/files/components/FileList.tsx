// src/features/files/components/FileList.tsx

import { FileConfiguration, FileStatus } from '../types';
import { mockLayouts } from '@/features/layouts/mockData';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Send, 
  Calendar, 
  Table2, 
  Bell,
  AlertTriangle,
  CheckCircle2,
  BellOff,
  Globe,
  Database,
  Lock
} from 'lucide-react';
import { cn } from "@/lib/utils";

export interface FileListProps {
  files: FileConfiguration[];
  onEdit: (file: FileConfiguration) => void;
  onDelete: (file: FileConfiguration) => void;
  onStatusChange: (fileId: string, newStatus: FileStatus) => void;
}

export default function FileList({
  files,
  onEdit,
  onDelete,
  onStatusChange
}: FileListProps) {
  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
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

  const getLayoutInfo = (layoutId: string) => {
    return mockLayouts.find(layout => layout.id === layoutId);
  };

  const getScheduleInfo = (file: FileConfiguration) => {
    if (!file.scheduleConfig) return null;

    const { frequency, time, timezone, daysOfWeek, daysOfMonth } = file.scheduleConfig;
    let scheduleText = '';

    switch (frequency) {
      case 'daily':
        scheduleText = `Daily at ${time}`;
        break;
      case 'weekly':
        const days = daysOfWeek?.map(d =>
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
        ).join(', ');
        scheduleText = `Weekly on ${days} at ${time}`;
        break;
      case 'monthly':
        const dates = daysOfMonth?.join(', ');
        scheduleText = `Monthly on day${daysOfMonth?.length === 1 ? '' : 's'} ${dates} at ${time}`;
        break;
    }

    return `${scheduleText} (${timezone})`;
  };

  const getNotificationInfo = (file: FileConfiguration) => {
    if (!file.notificationConfig) return null;

    const { notifyOnSuccess, notifyOnFailure, notificationEmails, retryConfig } = file.notificationConfig;
    return {
      success: notifyOnSuccess,
      failure: notifyOnFailure,
      emails: notificationEmails,
      retries: retryConfig ? `${retryConfig.maxAttempts} attempts, ${retryConfig.delayMinutes}m delay` : null
    };
  };

  return (
    <Card className="file-list">
      <CardHeader>
        <CardTitle>File Configurations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Layout</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead>Notifications</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const layout = getLayoutInfo(file.layoutId);
              const layoutActive = layout?.status === 'active';
              const scheduleInfo = getScheduleInfo(file);
              const notificationInfo = getNotificationInfo(file);

              return (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {file.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Table2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {layout?.name || 'Unknown Layout'}
                            </span>
                            {layout && layout.status !== 'active' && (
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-600"
                              >
                                {layout.status}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{layout?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Type: {layout?.type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {layout?.status}
                            </p>
                            {layout?.status !== 'active' && (
                              <p className="text-sm text-amber-600">
                                File cannot be activated until layout is active
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{file.format}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(file.status)}
                    >
                      {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* Delivery Configuration */}
                      {file.deliveryConfig && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="gap-1 w-fit"
                              >
                                {file.deliveryConfig.type === 'sftp' && (
                                  <>
                                    <Send className="h-3 w-3" />
                                    SFTP
                                  </>
                                )}
                                {file.deliveryConfig.type === 'api' && (
                                  <>
                                    <Globe className="h-3 w-3" />
                                    API
                                  </>
                                )}
                                {file.deliveryConfig.type === 'database' && (
                                  <>
                                    <Database className="h-3 w-3" />
                                    DB
                                  </>
                                )}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {file.deliveryConfig.type === 'sftp' && file.deliveryConfig.sftp && (
                                  <>
                                    <p className="text-sm">Host: {file.deliveryConfig.sftp.host}</p>
                                    <p className="text-sm">Path: {file.deliveryConfig.sftp.path}</p>
                                  </>
                                )}
                                {file.deliveryConfig.type === 'api' && file.deliveryConfig.api && (
                                  <>
                                    <p className="text-sm font-medium">{file.deliveryConfig.api.method} Request</p>
                                    <p className="text-sm">URL: {file.deliveryConfig.api.url}</p>
                                    <p className="text-sm">Timeout: {file.deliveryConfig.api.timeout}s</p>
                                    {file.deliveryConfig.api.retryStrategy && (
                                      <p className="text-sm">
                                        Retries: {file.deliveryConfig.api.retryStrategy.maxRetries}x
                                        ({file.deliveryConfig.api.retryStrategy.backoffMultiplier}x backoff)
                                      </p>
                                    )}
                                  </>
                                )}
                                {file.deliveryConfig.type === 'database' && file.deliveryConfig.database && (
                                  <>
                                    <p className="text-sm font-medium">{file.deliveryConfig.database.type}</p>
                                    <p className="text-sm">
                                      {file.deliveryConfig.database.host}:{file.deliveryConfig.database.port}
                                    </p>
                                    <p className="text-sm">
                                      {file.deliveryConfig.database.schema}.{file.deliveryConfig.database.table}
                                    </p>
                                    <p className="text-sm">Mode: {file.deliveryConfig.database.writeMode}</p>
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Schedule Configuration */}
                      {scheduleInfo && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="gap-1 w-fit">
                                <Calendar className="h-3 w-3" />
                                Scheduled
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{scheduleInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Encryption Configuration */}
                      {file.encryptionConfig?.enabled && (
                        <Badge variant="outline" className="gap-1 w-fit">
                          <Lock className="h-3 w-3" />
                          PGP
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {notificationInfo ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <div className="flex gap-1">
                                {notificationInfo.success && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                )}
                                {notificationInfo.failure && (
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Notifications</p>
                                <p className="text-xs">
                                  Success: {notificationInfo.success ? 'Enabled' : 'Disabled'}
                                </p>
                                <p className="text-xs">
                                  Failure: {notificationInfo.failure ? 'Enabled' : 'Disabled'}
                                </p>
                                {notificationInfo.retries && (
                                  <p className="text-xs">Retries: {notificationInfo.retries}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Recipients</p>
                                {notificationInfo.emails.map(email => (
                                  <p key={email} className="text-xs">{email}</p>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatDate(file.updatedAt)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Created: {formatDate(file.createdAt)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(file)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit File
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {file.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(file.id, 'active')}
                            className={cn(
                              "text-green-600",
                              !layoutActive && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!layoutActive}
                          >
                            <div className="flex flex-col">
                              <span className="flex items-center">
                                Activate
                              </span>
                              {!layoutActive && (
                                <span className="text-xs text-muted-foreground">
                                  Layout must be active first
                                </span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        )}

                        {file.status === 'active' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onStatusChange(file.id, 'inactive')}
                              className="text-red-600"
                            >
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onStatusChange(file.id, 'draft')}
                              className="text-gray-600"
                            >
                              Return to Draft
                            </DropdownMenuItem>
                          </>
                        )}

                        {file.status === 'inactive' && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(file.id, 'draft')}
                            className="text-gray-600"
                          >
                            Return to Draft
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(file)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}