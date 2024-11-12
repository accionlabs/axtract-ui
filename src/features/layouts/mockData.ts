// src/features/layouts/mockData.ts
import { Layout, LayoutField, LayoutType } from './types';

// Shared utilities
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Define field categories per layout type
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

// Standard field validations
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
};

// Claims Library Fields
export const claimsLibraryFields = [
  {
    id: 'claim_id',
    name: 'Claim ID',
    type: 'string' as const,
    description: 'Unique identifier for the claim',
    required: true,
    category: 'Claim Information',
    validation: {
      pattern: '^CLM[0-9]{10}$'
    }
  },
  {
    id: 'member_id',
    name: 'Member ID',
    type: 'string' as const,
    description: 'Member identifier',
    required: true,
    category: 'Member Information',
    validation: standardValidations.memberId
  },
  {
    id: 'claim_date',
    name: 'Claim Date',
    type: 'date' as const,
    description: 'Date when claim was filed',
    required: true,
    category: 'Claim Information'
  },
  {
    id: 'service_date',
    name: 'Service Date',
    type: 'date' as const,
    description: 'Date of service',
    required: true,
    category: 'Claim Information'
  },
  {
    id: 'provider_id',
    name: 'Provider ID',
    type: 'string' as const,
    description: 'Provider identifier',
    required: true,
    category: 'Provider Information',
    validation: {
      pattern: '^PRV[0-9]{8}$'
    }
  },
  {
    id: 'provider_name',
    name: 'Provider Name',
    type: 'string' as const,
    description: 'Name of the provider',
    required: true,
    category: 'Provider Information',
    validation: standardValidations.name
  },
  {
    id: 'amount_billed',
    name: 'Amount Billed',
    type: 'decimal' as const,
    description: 'Total amount billed by provider',
    required: true,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'amount_allowed',
    name: 'Amount Allowed',
    type: 'decimal' as const,
    description: 'Allowed amount for the service',
    required: true,
    category: 'Financial Information',
    validation: standardValidations.amount
  }
];

// Eligibility Library Fields
export const eligibilityLibraryFields = [
  {
    id: 'member_id',
    name: 'Member ID',
    type: 'string' as const,
    description: 'Unique identifier for the member',
    required: true,
    category: 'Member Information',
    validation: standardValidations.memberId
  },
  {
    id: 'first_name',
    name: 'First Name',
    type: 'string' as const,
    description: 'Member\'s first name',
    required: true,
    category: 'Member Information',
    validation: standardValidations.name
  },
  {
    id: 'last_name',
    name: 'Last Name',
    type: 'string' as const,
    description: 'Member\'s last name',
    required: true,
    category: 'Member Information',
    validation: standardValidations.name
  },
  {
    id: 'effective_date',
    name: 'Effective Date',
    type: 'date' as const,
    description: 'Coverage effective date',
    required: true,
    category: 'Coverage Information'
  },
  {
    id: 'termination_date',
    name: 'Termination Date',
    type: 'date' as const,
    description: 'Coverage termination date',
    required: false,
    category: 'Coverage Information'
  },
  {
    id: 'plan_type',
    name: 'Plan Type',
    type: 'string' as const,
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
    type: 'string' as const,
    description: 'Level of coverage',
    required: true,
    category: 'Plan Information',
    validation: {
      enum: ['Individual', 'Family']
    }
  }
];

// Wellness Library Fields
export const wellnessLibraryFields = [
  {
    id: 'member_id',
    name: 'Member ID',
    type: 'string' as const,
    description: 'Unique identifier for the member',
    required: true,
    category: 'Member Information',
    validation: standardValidations.memberId
  },
  {
    id: 'program_id',
    name: 'Program ID',
    type: 'string' as const,
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
    type: 'date' as const,
    description: 'Date of program enrollment',
    required: true,
    category: 'Program Information'
  },
  {
    id: 'activity_type',
    name: 'Activity Type',
    type: 'string' as const,
    description: 'Type of wellness activity',
    required: true,
    category: 'Activity Information',
    validation: {
      enum: ['Exercise', 'Nutrition', 'Mental Health', 'Preventive Care']
    }
  },
  {
    id: 'completion_status',
    name: 'Completion Status',
    type: 'string' as const,
    description: 'Status of activity completion',
    required: true,
    category: 'Activity Information',
    validation: {
      enum: ['Not Started', 'In Progress', 'Completed']
    }
  }
];

// Helper function to get library fields by type
export const getLibraryFieldsByType = (type: LayoutType) => {
  switch (type) {
    case 'claims':
      return claimsLibraryFields;
    case 'eligibility':
      return eligibilityLibraryFields;
    case 'wellness':
      return wellnessLibraryFields;
    default:
      return [];
  }
};

export const LAYOUT_IDS = {
  CLAIMS: 'layout-claims-standard',
  ELIGIBILITY: 'layout-elig-basic',
  WELLNESS: 'layout-wellness-basic'
} as const;

// Mock Layouts
export const mockLayouts: Layout[] = [
  {
    id: LAYOUT_IDS.CLAIMS,
    name: 'Standard Claims Extract',
    description: 'Standard claims extract including payment and procedure information',
    type: 'claims',
    status: 'active',
    version: 1,
    lastModified: '2024-01-15T08:00:00Z',
    fields: claimsLibraryFields.map((field, index) => ({
      ...field,
      id: `${LAYOUT_IDS.CLAIMS}-field-${index}`,
      order: index,
      customProperties: {}
    })) as LayoutField[]
  },
  {
    id: LAYOUT_IDS.ELIGIBILITY,
    name: 'Basic Eligibility Extract',
    description: 'Basic member eligibility information extract',
    type: 'eligibility',
    status: 'active',
    version: 1,
    lastModified: '2024-01-10T14:15:00Z',
    fields: eligibilityLibraryFields.map((field, index) => ({
      ...field,
      id: `${LAYOUT_IDS.ELIGIBILITY}-field-${index}`,
      order: index,
      customProperties: {}
    })) as LayoutField[]
  },
  {
    id: LAYOUT_IDS.WELLNESS,
    name: 'Wellness Program Extract',
    description: 'Wellness program participation and activity tracking',
    type: 'wellness',
    status: 'draft',
    version: 1,
    lastModified: '2024-02-20T10:30:00Z',
    fields: wellnessLibraryFields.map((field, index) => ({
      ...field,
      id: `${LAYOUT_IDS.WELLNESS}-field-${index}`,
      order: index,
      customProperties: {}
    })) as LayoutField[]
  }
];

// Sample data generator
export const generateSampleDataForField = (field: LayoutField) => {
  switch (field.type) {
    case 'string':
      if (field.name.toLowerCase().includes('id')) {
        return field.validation?.pattern 
          ? field.validation.pattern.replace(/[\^\$]/g, '').replace(/[0-9]{6}/, '123456')
          : 'ABC123';
      }
      if (field.validation?.enum) {
        return field.validation.enum[0];
      }
      return `Sample ${field.name}`;
    case 'decimal':
      return field.name.toLowerCase().includes('amount') ? 1234.56 : 100.00;
    case 'number':
      return 12345;
    case 'date':
      return '2024-01-01';
    case 'boolean':
      return true;
    default:
      return null;
  }
};

export const convertToLayoutField = (field: typeof claimsLibraryFields[0], order: number): LayoutField => ({
  ...field,
  id: generateId(),
  order,
  customProperties: {}
});