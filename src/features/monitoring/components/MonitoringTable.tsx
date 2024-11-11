// src/features/monitoring/components/MonitoringTable.tsx

import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
  Ban,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProcessingStatus, FileProcessingDetails, MonitoringTableProps } from "../types";
import { statusColors, pageSizeOptions, formatDuration } from "../mockData";

const statusIcons: Record<ProcessingStatus, any> = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: Ban,
};

export function MonitoringTable({
  files,
  filters,
  onFiltersChange,
  onRetry,
  onCancel,
  totalItems,
  isLoading = false,
}: MonitoringTableProps) {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / filters.pageSize);
  const currentPage = filters.page;

  // Generate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  // Calculate progress percentage
  const getProgress = (file: FileProcessingDetails) => {
    if (!file.totalRecords || !file.recordsProcessed) return 0;
    return (file.recordsProcessed / file.totalRecords) * 100;
  };

  // Format date with relative time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "PPp");
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    onFiltersChange({
      pageSize: parseInt(newSize),
      page: 1, // Reset to first page when changing page size
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onFiltersChange({ page: newPage });
    }
  };

  // Custom button components for pagination that support disabled state
  const PaginationButton = ({ 
    onClick, 
    disabled, 
    children 
  }: { 
    onClick: () => void; 
    disabled: boolean; 
    children: React.ReactNode 
  }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8"
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: filters.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))
            ) : files.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No files found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              files.map((file) => {
                const StatusIcon = statusIcons[file.status];
                const progress = getProgress(file);
                const duration = file.startTime && file.endTime
                  ? (new Date(file.endTime).getTime() - new Date(file.startTime).getTime()) / 1000
                  : 0;

                return (
                  <TableRow key={file.processId}>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn(
                                "h-4 w-4",
                                file.status === "processing" && "animate-spin",
                                statusColors[file.status]
                              )} />
                              <Badge 
                                variant="secondary"
                                className={statusColors[file.status]}
                              >
                                {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          {file.errorDetails && (
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium text-red-500">Error Details:</p>
                                {file.errorDetails.map((error, index) => (
                                  <div key={index} className="text-sm">
                                    <p>{error.message}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(error.timestamp), "PPp")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{file.fileName}</span>
                        <span className="text-sm text-muted-foreground">
                          ID: {file.processId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {file.status === "processing" ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>
                              {file.recordsProcessed?.toLocaleString()} of {file.totalRecords?.toLocaleString()}
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      ) : (
                        <span>
                          {file.recordsProcessed?.toLocaleString() ?? 0} records
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {file.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(file.startTime)}
                    </TableCell>
                    <TableCell>
                      {duration > 0 ? formatDuration(duration) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {file.status === "failed" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRetry(file.processId)}
                                  disabled={file.retryCount >= file.maxRetries}
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {file.retryCount >= file.maxRetries
                                  ? `Max retries (${file.maxRetries}) reached`
                                  : `Retry (${file.retryCount}/${file.maxRetries})`
                                }
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {(file.status === "processing" || file.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancel(file.processId)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * filters.pageSize + 1, totalItems)} to{" "}
            {Math.min(currentPage * filters.pageSize, totalItems)} of {totalItems} results
          </p>
          <Select
            value={filters.pageSize.toString()}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1">
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            ←
          </PaginationButton>
          
          {getPaginationRange().map((page) => (
            <PaginationButton
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
            >
              {page}
            </PaginationButton>
          ))}
          
          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            →
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}