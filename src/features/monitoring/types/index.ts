// src/features/monitoring/types/index.ts

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type FileSource = 'manual' | 'scheduled';

// Update the FileProcessingDetails interface to include createdAt
export interface FileProcessingDetails {
  processId: string;
  fileId: string;
  fileName: string;
  status: ProcessingStatus;
  source: FileSource;
  startTime?: string;
  endTime?: string;
  createdAt: string;  // Added this field
  recordsProcessed?: number;
  totalRecords?: number;
  errorDetails?: {
    code: string;
    message: string;
    timestamp: string;
  }[];
  retryCount: number;
  maxRetries: number;
  nextRetryTime?: string;
}

export interface MonitoringFilters {
  fileName?: string;
  status?: ProcessingStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  source?: FileSource[];
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MonitoringStatsData {
  totalFiles: number;
  filesInProgress: number;
  failedFiles: number;
  completedToday: number;
  averageProcessingTime: number; // in seconds
  successRate: number; // percentage
}

export interface RetryOptions {
  processId: string;
  maxRetries?: number;
  retryDelay?: number; // in minutes
}

// Form interfaces
export interface DateRangeValue {
  from: Date | undefined;
  to: Date | undefined;
}

export interface MonitoringTableProps {
  files: FileProcessingDetails[];
  filters: MonitoringFilters;
  onFiltersChange: (filters: Partial<MonitoringFilters>) => void;
  onRetry: (processId: string) => void;
  onCancel: (processId: string) => void;
  totalItems: number;
  isLoading?: boolean;
}

export interface MonitoringFilterProps {
  filters: MonitoringFilters;
  onFiltersChange: (filters: Partial<MonitoringFilters>) => void;
  isLoading?: boolean;
}

export interface MonitoringStatsProps {
  stats: MonitoringStatsData;
  isLoading?: boolean;
}