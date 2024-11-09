// src/features/layouts/types/index.ts

export type LayoutStatus = 'draft' | 'pending' | 'active';

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'decimal';

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  status: LayoutStatus;
  version: number;
  lastModified: string;
  fields: Field[];
}

export interface LayoutFormField {
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
}

export interface LayoutFormValues {
  name: string;
  description: string;
  fields: LayoutFormField[];
}