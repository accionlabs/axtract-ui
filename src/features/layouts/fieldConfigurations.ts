// src/features/layouts/fieldConfigurations.ts

import { StandardField, LayoutField, LayoutFormField, LayoutType, FieldType, FieldValidation } from './types';

// Define valid categories for each layout type
export const FIELD_CATEGORIES = {
  claims: [
    'Member Information',
    'Claim Information',
    'Provider Information',
    'Financial Information'
  ],
  eligibility: [
    'Member Information',
    'Coverage Information',
    'Plan Information'
  ],
  wellness: [
    'Member Information',
    'Program Information',
    'Activity Information'
  ]
} as const;

// Standard validations that can be reused
const standardValidations = {
  memberId: {
    pattern: '^[A-Z0-9]{10}$',
    maxLength: 10
  },
  name: {
    maxLength: 50
  },
  amount: {
    min: 0,
    precision: 2
  }
} as const;

// Base member fields shared across layouts
const baseMemberFields: StandardField[] = [
  {
    id: 'member_id',
    name: 'Member ID',
    type: 'string',
    description: 'Unique identifier for the member',
    required: true,
    category: 'Member Information',
    validation: standardValidations.memberId
  },
  {
    id: 'first_name',
    name: 'First Name',
    type: 'string',
    description: 'Member\'s first name',
    required: true,
    category: 'Member Information',
    validation: standardValidations.name
  },
  {
    id: 'last_name',
    name: 'Last Name',
    type: 'string',
    description: 'Member\'s last name',
    required: true,
    category: 'Member Information',
    validation: standardValidations.name
  }
];

// Library field definitions
export const claimsLibraryFields: StandardField[] = [
  ...baseMemberFields,
  {
    id: 'claim_id',
    name: 'Claim ID',
    type: 'string',
    description: 'Unique identifier for the claim',
    required: true,
    category: 'Claim Information',
    validation: {
      pattern: '^CLM[0-9]{10}$'
    }
  },
  // ... rest of claims fields
];

export const eligibilityLibraryFields: StandardField[] = [
  ...baseMemberFields,
  {
    id: 'group_id',
    name: 'Group ID',
    type: 'string',
    description: 'Employer group identifier',
    required: true,
    category: 'Coverage Information',
    validation: {
      pattern: '^GRP[0-9]{7}$'
    }
  },
  // ... rest of eligibility fields
];

export const wellnessLibraryFields: StandardField[] = [
  ...baseMemberFields,
  {
    id: 'program_id',
    name: 'Program ID',
    type: 'string',
    description: 'Identifier for wellness program',
    required: true,
    category: 'Program Information',
    validation: {
      pattern: '^WP[0-9]{6}$'
    }
  },
  // ... rest of wellness fields
];

// Normalized form field interface
interface NormalizedFormField {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  category: string;
  validation?: FieldValidation;
}

// Form field conversion
export const formFieldToStandardField = (formField: Partial<LayoutFormField>): StandardField => {
  const normalizedField: NormalizedFormField = {
    id: formField.id || `field-${Date.now()}`,
    name: formField.name || '',
    type: formField.type || 'string',
    description: formField.description || '',
    required: formField.required || false,
    category: formField.category || 'Other',
    validation: formField.validation
  };

  return normalizedField;
};

// Convert standard field to layout field
export const convertToLayoutField = (field: StandardField, order: number): LayoutField => ({
  ...field,
  id: field.id,
  order,
  customProperties: {}
});

// Utility functions
export const isValidCategory = (category: string, layoutType: LayoutType): boolean => {
  return FIELD_CATEGORIES[layoutType]?.includes(category as any) || category === 'Other';
};

export const getAvailableCategories = (layoutType: LayoutType): string[] => {
  return [...FIELD_CATEGORIES[layoutType], 'Other'];
};

export const getFieldsByLayoutType = (type: LayoutType): StandardField[] => {
  switch (type) {
    case 'claims':
      return claimsLibraryFields;
    case 'wellness':
      return wellnessLibraryFields;
    case 'eligibility':
      return eligibilityLibraryFields;
    default:
      return [];
  }
};

export const groupFieldsByCategory = (fields: StandardField[]): Record<string, StandardField[]> => {
  return fields.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, StandardField[]>);
};