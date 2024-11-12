// src/features/monitoring/mockData.ts

import { FileProcessingDetails, MonitoringStatsData, ProcessingStatus, MonitoringFilters, FileSource } from './types';
import { mockFiles } from '../files/mockData';

// Helper functions for date generation
const getRecentDate = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const getRandomDuration = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Helper to get random source with proper typing
const getRandomSource = (): FileSource => 
  Math.random() > 0.3 ? 'scheduled' : 'manual';

// Generate process IDs
const generateProcessId = () => `proc-${Math.random().toString(36).substr(2, 9)}`;

// Create monitoring entries based on existing files
export const mockMonitoringData: FileProcessingDetails[] = [
  // Claims Data Extract (daily file)
  {
    processId: generateProcessId(),
    fileId: 'file-1',
    fileName: 'Claims Data Extract',
    status: 'completed',
    source: 'scheduled',
    startTime: getRecentDate(24),
    endTime: getRecentDate(23),
    createdAt: getRecentDate(24),
    recordsProcessed: 15000,
    totalRecords: 15000,
    retryCount: 0,
    maxRetries: 3
  },
  {
    processId: generateProcessId(),
    fileId: 'file-1',
    fileName: 'Claims Data Extract',
    status: 'processing',
    source: 'scheduled',
    startTime: getRecentDate(1),
    createdAt: getRecentDate(1),
    recordsProcessed: 8500,
    totalRecords: 15000,
    retryCount: 0,
    maxRetries: 3
  },
  
  // Provider Summary Report (weekly file)
  {
    processId: generateProcessId(),
    fileId: 'file-2',
    fileName: 'Provider Summary Report',
    status: 'completed',
    source: 'scheduled',
    startTime: getRecentDate(168), // 7 days ago
    endTime: getRecentDate(167),
    createdAt: getRecentDate(168),
    recordsProcessed: 5000,
    totalRecords: 5000,
    retryCount: 0,
    maxRetries: 2
  },
  
  // Monthly Financial Report
  {
    processId: generateProcessId(),
    fileId: 'file-3',
    fileName: 'Monthly Financial Report',
    status: 'failed',
    source: 'scheduled',
    startTime: getRecentDate(48),
    endTime: getRecentDate(47),
    createdAt: getRecentDate(48),
    recordsProcessed: 0,
    totalRecords: 10000,
    retryCount: 5,
    maxRetries: 5,
    errorDetails: [{
      code: 'SFTP_CONN_ERROR',
      message: 'SFTP connection timeout',
      timestamp: getRecentDate(47)
    }]
  },
  
  // Member Updates (manual run)
  {
    processId: generateProcessId(),
    fileId: 'file-4',
    fileName: 'Member Updates',
    status: 'pending',
    source: 'manual',
    createdAt: getRecentDate(2),
    retryCount: 0,
    maxRetries: 3
  },
  
  // Wellness Program Extract
  {
    processId: generateProcessId(),
    fileId: 'file-5',
    fileName: 'Wellness Program Extract',
    status: 'completed',
    source: 'scheduled',
    startTime: getRecentDate(120),
    endTime: getRecentDate(119),
    createdAt: getRecentDate(120),
    recordsProcessed: 7500,
    totalRecords: 7500,
    retryCount: 1,
    maxRetries: 3,
  },
  
  // Additional runs with various statuses
  ...Array.from({ length: 20 }, (_, index) => {
    const file = mockFiles[index % mockFiles.length];
    const status: ProcessingStatus = ['completed', 'failed', 'completed', 'completed', 'cancelled'][Math.floor(Math.random() * 5)] as ProcessingStatus;
    const hoursAgo = index * 2 + Math.floor(Math.random() * 12);
    const duration = getRandomDuration(10, 45); // minutes
    const startTime = getRecentDate(hoursAgo);
    const endTime = status !== 'processing' ? getRecentDate(hoursAgo - (duration / 60)) : undefined;
    const records = Math.floor(Math.random() * 10000) + 1000;
    
    const entry: FileProcessingDetails = {
      processId: generateProcessId(),
      fileId: file.id,
      fileName: file.name,
      status,
      source: getRandomSource(), // Using properly typed source
      startTime,
      endTime,
      createdAt: startTime,
      recordsProcessed: status === 'completed' ? records : Math.floor(records * 0.7),
      totalRecords: records,
      retryCount: status === 'failed' ? Math.floor(Math.random() * 3) : 0,
      maxRetries: 3,
      errorDetails: status === 'failed' ? [{
        code: ['DB_ERROR', 'NETWORK_ERROR', 'TIMEOUT'][Math.floor(Math.random() * 3)],
        message: 'Processing failed due to system error',
        timestamp: endTime || startTime
      }] : undefined
    };
    
    return entry;
  })
];

// Calculate mock statistics
export const calculateMockStats = (data: FileProcessingDetails[]): MonitoringStatsData => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const completedToday = data.filter(file => 
    file.status === 'completed' && 
    file.endTime && 
    new Date(file.endTime) >= todayStart
  ).length;

  const allCompleted = data.filter(file => file.status === 'completed');
  const totalProcessingTime = allCompleted.reduce((sum, file) => {
    if (file.startTime && file.endTime) {
      return sum + (new Date(file.endTime).getTime() - new Date(file.startTime).getTime()) / 1000;
    }
    return sum;
  }, 0);

  const avgProcessingTime = allCompleted.length > 0 ? totalProcessingTime / allCompleted.length : 0;

  return {
    totalFiles: data.length,
    filesInProgress: data.filter(file => file.status === 'processing' || file.status === 'pending').length,
    failedFiles: data.filter(file => file.status === 'failed').length,
    completedToday,
    averageProcessingTime: Math.round(avgProcessingTime),
    successRate: Math.round((allCompleted.length / data.length) * 100)
  };
};

// Status colors for UI
export const statusColors: Record<ProcessingStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-yellow-100 text-yellow-800'
};

// Helper function to format duration
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

// Predefined date ranges for filters
export const dateRangeOptions = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Custom Range', value: 'custom' }
];

// Page size options
export const pageSizeOptions = [
  { label: '10 per page', value: 10 },
  { label: '20 per page', value: 20 },
  { label: '50 per page', value: 50 },
  { label: '100 per page', value: 100 }
];

// Initial filter state
export const initialFilters: MonitoringFilters = {
  fileName: '',
  status: undefined,
  dateRange: undefined,
  source: undefined,
  page: 1,
  pageSize: 20
};