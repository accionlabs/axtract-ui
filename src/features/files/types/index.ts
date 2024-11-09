// src/features/fileManager/types.ts
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

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'decimal';
export type LayoutStatus = 'draft' | 'pending' | 'active';
export type LayoutType = 'claims' | 'wellness' | 'eligibility';

export interface FieldValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  precision?: number;
  enum?: string[];
}

export interface BaseField {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
}

export interface StandardField extends BaseField {
  category: string;
  validation?: FieldValidation;
}

export interface LayoutField extends StandardField {
  order: number;
  customProperties?: {
    [key: string]: any;
  };
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  type: LayoutType;
  status: LayoutStatus;
  version: number;
  lastModified: string;
  fields: LayoutField[];
}

export interface LayoutFormField {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  category: string;
  order: number;
  validation?: FieldValidation;
  customProperties?: Record<string, any>;
}

export interface LayoutFormValues {
  name: string;
  description: string;
  type: LayoutType;
  fields: LayoutFormField[];
}