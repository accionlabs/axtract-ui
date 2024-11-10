// src/features/files/types/index.ts

export type FileFormat = 'CSV' | 'TSV' | 'FIXED';
export type FileStatus = 'draft' | 'active' | 'inactive';

export interface SFTPConfiguration {
  host: string;
  port: number;
  username: string;
  path: string;
  knownHostKey?: string;
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
  sftpConfig?: SFTPConfiguration;
  scheduleConfig?: ScheduleConfiguration;
  encryptionConfig?: EncryptionConfiguration;
}

export interface FileFormValues {
  name: string;
  layoutId: string;
  format: FileFormat;
  sftpConfig?: SFTPConfiguration;
  scheduleConfig?: ScheduleConfiguration;
  encryptionConfig?: EncryptionConfiguration;
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