// src/features/sources/utils/query.ts

import { 
    QueryDefinition, 
    Field, 
    JoinCondition,
    QueryValidation,
    ValidationMessage,
    FilterCondition,
    QuerySource,
    QueryResult
  } from '../types';
  import { mockQueryResults, fieldMetadata } from '../mockData/queries';
  
  // Helper to get available fields for a source
  export const getSourceFields = (source: QuerySource): Field[] => {
    const sourceKey = source.table?.toLowerCase() || '';
    return fieldMetadata[sourceKey as keyof typeof fieldMetadata] || [];
  };
  
  // Helper to check field compatibility for joins
  const areFieldsCompatible = (field1: Field, field2: Field): boolean => {
    // Direct type match
    if (field1.type === field2.type) return true;
  
    // Compatible numeric types
    if (['decimal', 'number'].includes(field1.type) && 
        ['decimal', 'number'].includes(field2.type)) return true;
  
    return false;
  };
  
  // Validate join compatibility
  const validateJoin = (join: JoinCondition): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];
    
    if (!areFieldsCompatible(join.leftField, join.rightField)) {
      messages.push({
        code: 'INCOMPATIBLE_TYPES',
        message: `Incompatible join field types: ${join.leftField.type} cannot be joined with ${join.rightField.type}`,
        severity: 'error',
        field: `${join.leftField.source}.${join.leftField.name}`
      });
    }
  
    return messages;
  };
  
  // Validate filter configuration
  const validateFilter = (filter: FilterCondition): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];
  
    // Check if the operator is valid for the field type
    const validOperators: Record<string, string[]> = {
      string: ['equals', 'notEquals', 'contains', 'in'],
      number: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between'],
      decimal: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between'],
      date: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between']
    };
  
    if (!validOperators[filter.field.type]?.includes(filter.operator)) {
      messages.push({
        code: 'INVALID_OPERATOR',
        message: `Operator '${filter.operator}' is not valid for field type '${filter.field.type}'`,
        severity: 'error',
        field: `${filter.field.source}.${filter.field.name}`
      });
    }
  
    return messages;
  };
  
  // Full query validation
  export const validateQuery = (query: QueryDefinition): QueryValidation => {
    const messages: ValidationMessage[] = [];
  
    // Validate basic requirements
    if (!query.sources.length) {
      messages.push({
        code: 'NO_SOURCES',
        message: 'Query must include at least one data source',
        severity: 'error'
      });
    }
  
    if (!query.selectedFields.length) {
      messages.push({
        code: 'NO_FIELDS',
        message: 'Query must include at least one field',
        severity: 'error'
      });
    }
  
    // Validate joins
    query.joins?.forEach(join => {
      messages.push(...validateJoin(join));
    });
  
    // Validate filters
    query.filters?.forEach(filter => {
      messages.push(...validateFilter(filter));
    });
  
    // Performance warnings
    if (query.selectedFields.length > 20) {
      messages.push({
        code: 'PERFORMANCE_WARNING',
        message: 'Large number of selected fields may impact performance',
        severity: 'warning'
      });
    }
  
    if (!query.filters || query.filters.length === 0) {
      messages.push({
        code: 'PERFORMANCE_WARNING',
        message: 'Consider adding filters to improve query performance',
        severity: 'warning'
      });
    }
  
    // Check for cross joins (missing join conditions)
    const sourcesNeedingJoins = query.sources.length > 1;
    const hasRequiredJoins = query.joins?.length >= query.sources.length - 1;
  
    if (sourcesNeedingJoins && !hasRequiredJoins) {
      messages.push({
        code: 'MISSING_JOINS',
        message: 'Missing join conditions between selected sources',
        severity: 'error'
      });
    }
  
    return {
      isValid: !messages.some(m => m.severity === 'error'),
      messages,
      timestamp: new Date().toISOString()
    };
  };
  
  // Helper to get preview data for a query
  export const getQueryPreview = async (query: QueryDefinition): Promise<QueryResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data if available
    if (mockQueryResults[query.id]) {
      return mockQueryResults[query.id];
    }
  
    // Generate sample data based on selected fields
    const rows = Array.from({ length: 5 }, (_, index) => 
      query.selectedFields.reduce((row: any, field: Field) => {
        switch (field.type) {
          case 'string':
            row[field.name] = `Sample${index + 1}`;
            break;
          case 'date':
            row[field.name] = new Date(2024, 2, index + 1).toISOString().split('T')[0];
            break;
          case 'decimal':
          case 'number':
            row[field.name] = parseFloat((100 + index * 10).toFixed(2));
            break;
          default:
            row[field.name] = null;
        }
        return row;
      }, {})
    );
  
    return {
      columns: query.selectedFields.map(field => ({
        name: field.name,
        type: field.type
      })),
      rows,
      totalRows: rows.length,
      executionTime: Math.random() * 2
    };
  };
  
  // Helper to generate SQL preview
  export const generateSqlPreview = (query: QueryDefinition): string => {
    const parts: string[] = [];
  
    // SELECT clause
    const selectClause = query.selectedFields
      .map(field => `${field.source}.${field.name}`)
      .join(', ');
    parts.push(`SELECT ${selectClause}`);
  
    // FROM clause
    const fromClause = `FROM ${query.sources[0].table} ${query.sources[0].alias}`;
    parts.push(fromClause);
  
    // JOIN clauses
    if (query.joins) {
      const joinClauses = query.joins.map(join => 
        `${join.type} JOIN ${join.rightField.table} ${join.rightField.source} ` +
        `ON ${join.leftField.source}.${join.leftField.name} = ${join.rightField.source}.${join.rightField.name}`
      );
      parts.push(...joinClauses);
    }
  
    // WHERE clause
    if (query.filters && query.filters.length > 0) {
      const whereClauses = query.filters.map(filter => {
        const field = `${filter.field.source}.${filter.field.name}`;
        switch (filter.operator) {
          case 'equals':
            return `${field} = ${filter.value}`;
          case 'greaterThan':
            return `${field} > ${filter.value}`;
          case 'lessThan':
            return `${field} < ${filter.value}`;
          case 'contains':
            return `${field} LIKE '%${filter.value}%'`;
          default:
            return null;
        }
      }).filter(clause => clause !== null);
  
      if (whereClauses.length > 0) {
        parts.push(`WHERE ${whereClauses.join(' AND ')}`);
      }
    }
  
    return parts.join('\n');
  };
  
  // Helper to estimate query performance
  export const estimateQueryPerformance = (query: QueryDefinition): {
    estimatedRows: number;
    estimatedTime: number;
    recommendations: string[];
  } => {
    const recommendations: string[] = [];
    let estimatedRows = 1000; // Base estimate
  
    // Adjust based on number of joins
    if (query.joins) {
      estimatedRows *= Math.pow(10, query.joins.length);
      if (query.joins.length > 2) {
        recommendations.push('Consider reducing the number of table joins');
      }
    }
  
    // Adjust based on filters
    if (query.filters && query.filters.length > 0) {
      estimatedRows = Math.floor(estimatedRows * 0.1);
    } else {
      recommendations.push('Adding filters would improve query performance');
    }
  
    // Check selected fields
    if (query.selectedFields.length > 15) {
      recommendations.push('Consider reducing the number of selected fields');
    }
  
    return {
      estimatedRows,
      estimatedTime: estimatedRows / 1000, // Rough estimate in seconds
      recommendations
    };
  };