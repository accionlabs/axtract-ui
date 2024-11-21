// src/features/sources/utils/validation.ts

import { 
    QueryDefinition,
    ValidationMessage,
    ValidationCode,
    ValidationCodes,
    ValidationRule,
    ValidationContext,
    ValidationErrors,
//    JoinValidationContext,
//    FilterValidationContext
  } from '../types';
  
  // Helper to create validation messages
  const createValidationMessage = (
    code: ValidationCode,
    severity: 'error' | 'warning' | 'info',
    context?: ValidationContext
  ): ValidationMessage => {
    const baseMessage = ValidationErrors[code];
    let message = baseMessage;
  
    // Enhance message with context
    if (context?.join) {
      const { leftField, leftType, rightField, rightType } = context.join;
      message = `${baseMessage}: Cannot join ${leftField} (${leftType}) with ${rightField} (${rightType})`;
    } else if (context?.filter) {
      const { field, operator, expectedType } = context.filter;
      message = `${baseMessage}: Invalid ${operator} operation on ${field} (expected ${expectedType})`;
    }
  
    return {
      code,
      message,
      severity,
      field: context?.field,
      source: context?.source,
      context
    };
  };
  
  // Validation rules
  const validationRules: ValidationRule[] = [
    // Check for sources
    {
      code: ValidationCodes.NO_SOURCES,
      validate: (query: QueryDefinition) => {
        if (!query.sources || query.sources.length === 0) {
          return [createValidationMessage(ValidationCodes.NO_SOURCES, 'error')];
        }
        return [];
      }
    },
  
    // Check for selected fields
    {
      code: ValidationCodes.NO_FIELDS,
      validate: (query: QueryDefinition) => {
        if (!query.selectedFields || query.selectedFields.length === 0) {
          return [createValidationMessage(ValidationCodes.NO_FIELDS, 'error')];
        }
        return [];
      }
    },
  
    // Validate joins
    {
      code: ValidationCodes.INVALID_JOIN,
      validate: (query: QueryDefinition) => {
        const messages: ValidationMessage[] = [];
        
        query.joins?.forEach(join => {
          const leftField = query.selectedFields.find(f => 
            f.source === join.leftField.source && f.name === join.leftField.name
          );
          const rightField = query.selectedFields.find(f => 
            f.source === join.rightField.source && f.name === join.rightField.name
          );
  
          if (!leftField || !rightField) {
            messages.push(createValidationMessage(
              ValidationCodes.INVALID_JOIN,
              'error',
              {
                join: {
                  leftField: join.leftField.name,
                  leftType: join.leftField.type,
                  rightField: join.rightField.name,
                  rightType: join.rightField.type
                }
              }
            ));
          } else if (leftField.type !== rightField.type) {
            messages.push(createValidationMessage(
              ValidationCodes.INCOMPATIBLE_TYPES,
              'error',
              {
                join: {
                  leftField: leftField.name,
                  leftType: leftField.type,
                  rightField: rightField.name,
                  rightType: rightField.type
                }
              }
            ));
          }
        });
  
        return messages;
      }
    }
  ];
  
  // Main validation function
  export const validateQuery = (
    query: QueryDefinition,
    context?: ValidationContext
  ): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];
  
    validationRules.forEach(rule => {
      messages.push(...rule.validate(query, context));
    });
  
    return messages;
  };
  
  // Helper to check if query is valid
  export const isQueryValid = (query: QueryDefinition): boolean => {
    const messages = validateQuery(query);
    return !messages.some(m => m.severity === 'error');
  };
  
  // Helper to get validation severity
  export const getQueryValidationSeverity = (messages: ValidationMessage[]): 'error' | 'warning' | 'info' | null => {
    if (messages.some(m => m.severity === 'error')) return 'error';
    if (messages.some(m => m.severity === 'warning')) return 'warning';
    if (messages.some(m => m.severity === 'info')) return 'info';
    return null;
  };