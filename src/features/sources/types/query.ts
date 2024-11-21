// src/features/sources/types/query.ts

// Basic field type for query builder
export interface Field {
    name: string;
    type: string;
    source: string;
    table?: string;
    alias?: string;
    description?:string;
    expression?: string;
  }
  
  // Join condition between fields
  export interface JoinCondition {
    leftField: Field;
    rightField: Field;
    type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  }
  
  // Source configuration in a query
  export interface QuerySource {
    sourceId: string;
    table?: string;
    alias: string;
  }
  
  // Filter condition
  export interface FilterCondition {
    field: Field;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in' | 'between';
    value: any;
    logicalOperator?: 'AND' | 'OR';
  }
  
  // Sorting configuration
  export interface SortConfig {
    field: Field;
    direction: 'ASC' | 'DESC';
  }
  
  // Aggregation configuration
  export interface AggregateConfig {
    field: Field;
    function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
    alias: string;
  }
  
  // Complete query definition
  export interface QueryDefinition {
    id: string;
    name: string;
    description?: string;
    sources: QuerySource[];
    selectedFields: Field[];
    joins: JoinCondition[];
    filters: FilterCondition[];
    groupBy?: Field[];
    having?: FilterCondition[];
    orderBy?: SortConfig[];
    aggregates?: AggregateConfig[];
    limit?: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    isTemplate?: boolean;
    tags?: string[];
  }
  
  // Query execution result
  export interface QueryResult {
    columns: Array<{
      name: string;
      type: string;
    }>;
    rows: any[];
    totalRows: number;
    executionTime: number;
  }
    
  // Query builder state
  export interface QueryBuilderState {
    currentQuery: QueryDefinition;
    availableFields: Field[];
    previewData?: QueryResult;
    validation?: QueryValidation;
    isDirty: boolean;
  }
  
  // Query template for saved/reusable queries
  export interface QueryTemplate extends Omit<QueryDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    templateId: string;
    version: number;
    parameters?: Array<{
      name: string;
      type: string;
      required: boolean;
      defaultValue?: any;
    }>;
  }

  export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationMessage {
  code: string;
  message: string;
  severity: ValidationSeverity;
  field?: string;
  source?: string;
  context?: Record<string, any>;
}

export interface QueryValidation {
  isValid: boolean;
  messages: ValidationMessage[];
  timestamp: string;
}

// Validation error codes
export const ValidationCodes = {
  NO_SOURCES: 'NO_SOURCES',
  NO_FIELDS: 'NO_FIELDS',
  INVALID_JOIN: 'INVALID_JOIN',
  AMBIGUOUS_FIELD: 'AMBIGUOUS_FIELD',
  INCOMPATIBLE_TYPES: 'INCOMPATIBLE_TYPES',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  INVALID_FILTER: 'INVALID_FILTER',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  UNDEFINED_SOURCE: 'UNDEFINED_SOURCE',
  INVALID_AGGREGATE: 'INVALID_AGGREGATE',
  INVALID_GROUP_BY: 'INVALID_GROUP_BY'
} as const;

// Utility type for validation codes
export type ValidationCode = typeof ValidationCodes[keyof typeof ValidationCodes];

// Validation context interfaces
export interface JoinValidationContext {
  leftField: string;
  leftType: string;
  rightField: string;
  rightType: string;
}

export interface FilterValidationContext {
  field: string;
  operator: string;
  value: any;
  expectedType: string;
}

// Define validation errors map
export const ValidationErrors: Record<ValidationCode, string> = {
  NO_SOURCES: 'Query must include at least one data source',
  NO_FIELDS: 'Query must select at least one field',
  INVALID_JOIN: 'Invalid join configuration between fields',
  AMBIGUOUS_FIELD: 'Field reference is ambiguous between multiple sources',
  INCOMPATIBLE_TYPES: 'Incompatible data types in operation',
  CIRCULAR_DEPENDENCY: 'Circular dependency detected in query',
  INVALID_FILTER: 'Invalid filter configuration',
  MISSING_REQUIRED_FIELD: 'Required field is missing from query',
  UNDEFINED_SOURCE: 'Referenced source is not defined',
  INVALID_AGGREGATE: 'Invalid aggregate function configuration',
  INVALID_GROUP_BY: 'Invalid GROUP BY configuration'
};

// Validation context type
export type ValidationContext = {
  join?: JoinValidationContext;
  filter?: FilterValidationContext;
  [key: string]: any;
};

// Validation utility function types
export interface ValidationResult {
  isValid: boolean;
  messages: ValidationMessage[];
}

export interface ValidationRule {
  code: ValidationCode;
  validate: (query: QueryDefinition, context?: ValidationContext) => ValidationMessage[];
}