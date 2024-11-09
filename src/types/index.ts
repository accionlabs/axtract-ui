// src/types/index.ts

export type FieldType = 'string' | 'date' | 'decimal' | 'integer';

export interface Field {
  name: string;
  type: FieldType;
  required: boolean;
}

export interface StaticField {
  name: string;
  value: string;
  length: number;
}

export interface Layout {
  id: number;
  name: string;
  version: string;
  status: 'Active' | 'Draft' | 'Archived';
  fields: Field[];
  staticFields: StaticField[];
  createdAt: string;
  updatedAt: string;
}

export interface SftpConfig {
  host: string;
  path: string;
  username: string;
}

export interface EncryptionConfig {
  enabled: boolean;
  type?: 'PGP';
}

export interface Notification {
  email: string;
  events: ('success' | 'failure')[];
}

export interface File {
  id: number;
  name: string;
  layoutId: number;
  format: 'CSV' | 'Fixed' | 'TSV';
  delimiter?: string;
  schedule: 'Daily' | 'Weekly' | 'Monthly';
  status: 'Active' | 'Inactive';
  sftp: SftpConfig;
  encryption: EncryptionConfig;
  notifications: Notification[];
}

export interface LastRun {
  status: 'Success' | 'Failed';
  startTime: string;
  endTime: string;
  error?: string;
}

export interface Schedule {
  id: number;
  fileId: number;
  type: 'Daily' | 'Weekly' | 'Monthly';
  startTime: string;
  maxDuration: string;
  nextRun: string;
  status: 'Active' | 'Inactive';
  lastRun: LastRun;
}

export interface Activity {
  id: number;
  type: string;
  status: 'Success' | 'Failed' | 'Info';
  details: string;
  timestamp: string;
}