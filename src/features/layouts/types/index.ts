// src/features/layouts/types/index.ts

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

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
}

export interface StandardField extends Field {
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
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
  category?: string;
  validation?: FieldValidation;
}

export interface LayoutFormValues {
  name: string;
  description: string;
  type: LayoutType;
  fields: LayoutFormField[];
}

export interface DraggableFieldProps {
  field: StandardField;
  isDragging?: boolean;
}

export interface DroppableAreaProps {
  onDrop: (field: StandardField) => void;
  children: React.ReactNode;
}