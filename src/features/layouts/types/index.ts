// src/features/layouts/types/index.ts

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'decimal';
export type LayoutType = 'claims' | 'eligibility' | 'wellness';
export type LayoutStatus = 'draft' | 'pending' | 'active';
export type TransformationType = 'FORMAT' | 'CONVERT' | 'COMPUTE';

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

export interface StandardField {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  category: string;
  validation?: FieldValidation;
}

// Base interface for field properties
interface BaseField {
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  category?: string;
  validation?: FieldValidation;
}

export interface FieldTransformation {
  type: TransformationType;
  operation: string;
  parameters?: Record<string, any>;
}

export interface SortConfiguration {
  direction: 'ASC' | 'DESC';
  priority: number;
}

// Form field type used in form submission
export interface LayoutFormField extends BaseField {
  id?: string; // Optional as it might not exist for new fields
  customProperties?: Record<string, any>; // Optional custom properties
}

// Full field type used in layout
export interface LayoutField extends BaseField {
  id: string;
  order: number;
  customProperties: Record<string, any>;
  transformation?: FieldTransformation;
  sortOrder?: SortConfiguration;
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

export interface LayoutFormValues {
  name: string;
  description: string;
  type: LayoutType;
  fields: LayoutFormField[];
}