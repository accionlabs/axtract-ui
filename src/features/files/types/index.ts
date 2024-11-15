// src/features/files/types/index.ts

export type FileStatus = 'draft' | 'active' | 'inactive';
export type DeliveryMethod = 'sftp' | 'api' | 'database';
export type FileFormat = 'CSV' | 'TSV' | 'JSON' | 'FIXED';

export interface NotificationConfig {
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationEmails: string[];
  retryConfig?: {
    maxAttempts: number;
    delayMinutes: number;
  };
}

export interface SFTPConfiguration {
  host: string;
  port: number;
  username: string;
  path: string;
  knownHostKey?: string;
}

export interface RetryStrategy {
  maxRetries: number;
  backoffMultiplier: number;
}

export interface APIConfiguration {
  method: 'POST' | 'PUT' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  validateSsl: boolean;
  timeout?: number;
  retryStrategy?: RetryStrategy;
}

export interface DatabaseConfiguration {
  type: 'postgresql' | 'mysql' | 'sqlserver' | 'oracle';
  host: string;
  port: number;
  name: string;
  username: string;
  schema: string;
  table: string;
  writeMode: 'insert' | 'upsert' | 'replace';
  batchSize?: number;
  connectionTimeout?: number;
}

export interface DeliveryConfiguration {
  type: DeliveryMethod;
  sftp?: SFTPConfiguration;
  api?: APIConfiguration;
  database?: DatabaseConfiguration;
}

export interface ScheduleConfiguration {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  timezone: string;
}

export interface EncryptionConfiguration {
  enabled: boolean;
  type: 'PGP';
  publicKey?: string;
}

export interface FileConfiguration {
  id: string;
  name: string;
  layoutId: string;
  format: FileFormat;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
  deliveryConfig?: DeliveryConfiguration;
  encryptionConfig?: EncryptionConfiguration;
  scheduleConfig?: ScheduleConfiguration;
  notificationConfig?: NotificationConfig;
}

export interface FileFormValues {
  name: string;
  layoutId: string;
  format: FileFormat;
  deliveryConfig?: DeliveryConfiguration;
  encryptionConfig?: EncryptionConfiguration;
  scheduleConfig?: ScheduleConfiguration;
  notificationConfig?: NotificationConfig;
}

export interface FileListProps {
  files: FileConfiguration[];
  onEdit: (file: FileConfiguration) => void;
  onDelete: (file: FileConfiguration) => void;
  onStatusChange: (fileId: string, newStatus: FileStatus) => void;
}

export interface FileStatsProps {
  files: FileConfiguration[];
}