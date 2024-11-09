// src/features/layoutManager/fieldConfigurations.ts

import { StandardField } from './types';

export type LayoutType = 'claims' | 'wellness' | 'eligibility';

// Reusable field categories for better organization
const baseFields: Omit<StandardField, 'category'>[] = [
  {
    id: 'member_id',
    name: 'Member ID',
    type: 'string',
    description: 'Unique identifier for the member',
    required: true,
    validation: {
      pattern: '^[A-Z0-9]{10}$',
      maxLength: 10
    }
  },
  {
    id: 'first_name',
    name: 'First Name',
    type: 'string',
    description: 'Member\'s first name',
    required: true,
    validation: {
      maxLength: 50
    }
  },
  {
    id: 'last_name',
    name: 'Last Name',
    type: 'string',
    description: 'Member\'s last name',
    required: true,
    validation: {
      maxLength: 50
    }
  }
];

// Claims-specific fields
export const claimsFields: StandardField[] = [
  ...baseFields.map(field => ({ ...field, category: 'Member Information' })),
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
  {
    id: 'claim_date',
    name: 'Claim Date',
    type: 'date',
    description: 'Date when the claim was filed',
    required: true,
    category: 'Claim Information'
  },
  {
    id: 'service_date',
    name: 'Service Date',
    type: 'date',
    description: 'Date when the service was provided',
    required: true,
    category: 'Claim Information'
  },
  {
    id: 'provider_id',
    name: 'Provider ID',
    type: 'string',
    description: 'Unique identifier for the provider',
    required: true,
    category: 'Provider Information',
    validation: {
      pattern: '^PRV[0-9]{8}$'
    }
  },
  {
    id: 'provider_name',
    name: 'Provider Name',
    type: 'string',
    description: 'Name of the provider',
    required: true,
    category: 'Provider Information'
  },
  {
    id: 'amount_billed',
    name: 'Amount Billed',
    type: 'decimal',
    description: 'Total amount billed by provider',
    required: true,
    category: 'Financial Information',
    validation: {
      min: 0,
      precision: 2
    }
  },
  {
    id: 'amount_paid',
    name: 'Amount Paid',
    type: 'decimal',
    description: 'Amount paid to provider',
    required: true,
    category: 'Financial Information',
    validation: {
      min: 0,
      precision: 2
    }
  }
];

// Wellness-specific fields
export const wellnessFields: StandardField[] = [
  ...baseFields.map(field => ({ ...field, category: 'Member Information' })),
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
  {
    id: 'enrollment_date',
    name: 'Enrollment Date',
    type: 'date',
    description: 'Date of program enrollment',
    required: true,
    category: 'Program Information'
  },
  {
    id: 'activity_type',
    name: 'Activity Type',
    type: 'string',
    description: 'Type of wellness activity',
    required: true,
    category: 'Activity Information'
  },
  {
    id: 'completion_status',
    name: 'Completion Status',
    type: 'string',
    description: 'Status of activity completion',
    required: true,
    category: 'Activity Information',
    validation: {
      enum: ['Not Started', 'In Progress', 'Completed']
    }
  }
];

// Eligibility-specific fields
export const eligibilityFields: StandardField[] = [
  ...baseFields.map(field => ({ ...field, category: 'Member Information' })),
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
  {
    id: 'effective_date',
    name: 'Effective Date',
    type: 'date',
    description: 'Coverage effective date',
    required: true,
    category: 'Coverage Information'
  },
  {
    id: 'termination_date',
    name: 'Termination Date',
    type: 'date',
    description: 'Coverage termination date',
    required: false,
    category: 'Coverage Information'
  },
  {
    id: 'plan_type',
    name: 'Plan Type',
    type: 'string',
    description: 'Type of insurance plan',
    required: true,
    category: 'Plan Information',
    validation: {
      enum: ['HMO', 'PPO', 'EPO']
    }
  },
  {
    id: 'coverage_level',
    name: 'Coverage Level',
    type: 'string',
    description: 'Level of coverage',
    required: true,
    category: 'Plan Information',
    validation: {
      enum: ['Individual', 'Family']
    }
  }
];

// Helper function to get fields by layout type
export const getFieldsByLayoutType = (type: LayoutType): StandardField[] => {
  switch (type) {
    case 'claims':
      return claimsFields;
    case 'wellness':
      return wellnessFields;
    case 'eligibility':
      return eligibilityFields;
    default:
      return [];
  }
};

// Function to group fields by category
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