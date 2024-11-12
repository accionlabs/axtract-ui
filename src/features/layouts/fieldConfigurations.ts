// src/features/layouts/fieldConfigurations.ts

import { StandardField, LayoutField, LayoutFormField, LayoutType, FieldType, FieldValidation } from './types';

// Define valid categories for each layout type
export const FIELD_CATEGORIES = {
  claims: [
    'Member Information',
    'Claim Information',
    'Provider Information',
    'Service Information',
    'Diagnosis Information',
    'Financial Information',
    'Authorization Information',
    'Additional Information'
  ],
  eligibility: [
    'Member Information',
    'Coverage Information',
    'Plan Information',
    'Benefit Information',
    'Network Information',
    'Dependent Information',
    'Additional Information'
  ],
  wellness: [
    'Member Information',
    'Program Information',
    'Activity Information',
    'Biometric Information',
    'Assessment Information',
    'Incentive Information',
    'Progress Information',
    'Additional Information'
  ]
} as const;

// Standard validations that can be reused
const standardValidations = {
  memberId: {
    pattern: '^[A-Z0-9]{10}$',
    maxLength: 10
  },
  name: {
    maxLength: 50,
    pattern: '^[A-Za-z\\s\'-]+$'
  },
  phone: {
    pattern: '^\\d{10}$',
    maxLength: 10
  },
  amount: {
    min: 0,
    precision: 2
  },
  date: {
    minLength: 10,
    maxLength: 10,
    pattern: '^\d{4}-\d{2}-\d{2}$'
  },
  npi: {
    pattern: '^\\d{10}$',
    maxLength: 10
  },
  taxId: {
    pattern: '^\\d{9}$',
    maxLength: 9
  },
  zip: {
    pattern: '^\\d{5}(-\\d{4})?$',
    maxLength: 10
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
    id: 'member_first_name',
    name: 'Member First Name',
    type: 'string',
    description: 'Member\'s first name',
    required: true,
    category: 'Member Information',
    validation: standardValidations.name
  },
  {
    id: 'member_last_name',
    name: 'Member Last Name',
    type: 'string',
    description: 'Member\'s last name',
    required: true,
    category: 'Member Information',
    validation: standardValidations.name
  },
  {
    id: 'member_dob',
    name: 'Date of Birth',
    type: 'date',
    description: 'Member\'s date of birth',
    required: true,
    category: 'Member Information',
    validation: standardValidations.date
  },
  {
    id: 'member_gender',
    name: 'Gender',
    type: 'string',
    description: 'Member\'s gender',
    required: true,
    category: 'Member Information',
    validation: {
      enum: ['M', 'F', 'U']
    }
  }
];

// Library field definitions
export const claimsLibraryFields: StandardField[] = [
  // Member Information
  ...baseMemberFields,
  // Claim Information
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
    id: 'claim_received_date',
    name: 'Claim Received Date',
    type: 'date',
    description: 'Date when claim was received',
    required: true,
    category: 'Claim Information',
    validation: standardValidations.date
  },
  {
    id: 'service_start_date',
    name: 'Service Start Date',
    type: 'date',
    description: 'Start date of service',
    required: true,
    category: 'Claim Information',
    validation: standardValidations.date
  },
  {
    id: 'service_end_date',
    name: 'Service End Date',
    type: 'date',
    description: 'End date of service',
    required: true,
    category: 'Claim Information',
    validation: standardValidations.date
  },
  {
    id: 'claim_type',
    name: 'Claim Type',
    type: 'string',
    description: 'Type of claim submission',
    required: true,
    category: 'Claim Information',
    validation: {
      enum: ['Professional', 'Institutional', 'Dental']
    }
  },
  {
    id: 'claim_status',
    name: 'Claim Status',
    type: 'string',
    description: 'Current status of the claim',
    required: true,
    category: 'Claim Information',
    validation: {
      enum: ['Paid', 'Denied', 'Pending', 'Adjusted']
    }
  },

  // Provider Information
  {
    id: 'provider_npi',
    name: 'Provider NPI',
    type: 'string',
    description: 'National Provider Identifier',
    required: true,
    category: 'Provider Information',
    validation: standardValidations.npi
  },
  {
    id: 'provider_tax_id',
    name: 'Provider Tax ID',
    type: 'string',
    description: 'Provider\'s tax identification number',
    required: true,
    category: 'Provider Information',
    validation: standardValidations.taxId
  },
  {
    id: 'provider_first_name',
    name: 'Provider First Name',
    type: 'string',
    description: 'Provider\'s first name',
    required: true,
    category: 'Provider Information',
    validation: standardValidations.name
  },
  {
    id: 'provider_last_name',
    name: 'Provider Last Name',
    type: 'string',
    description: 'Provider\'s last name',
    required: true,
    category: 'Provider Information',
    validation: standardValidations.name
  },
  {
    id: 'provider_specialty',
    name: 'Provider Specialty',
    type: 'string',
    description: 'Provider\'s medical specialty',
    required: false,
    category: 'Provider Information',
    validation: {
      maxLength: 50
    }
  },

  // Service Information
  {
    id: 'procedure_code',
    name: 'Procedure Code',
    type: 'string',
    description: 'CPT/HCPCS procedure code',
    required: true,
    category: 'Service Information',
    validation: {
      pattern: '^[A-Z0-9]{5}$'
    }
  },
  {
    id: 'procedure_modifier',
    name: 'Procedure Modifier',
    type: 'string',
    description: 'Procedure code modifier',
    required: false,
    category: 'Service Information',
    validation: {
      pattern: '^[A-Z0-9]{2}$'
    }
  },
  {
    id: 'revenue_code',
    name: 'Revenue Code',
    type: 'string',
    description: 'Revenue code for institutional claims',
    required: false,
    category: 'Service Information',
    validation: {
      pattern: '^[0-9]{4}$'
    }
  },
  {
    id: 'units',
    name: 'Units',
    type: 'number',
    description: 'Number of units of service',
    required: true,
    category: 'Service Information',
    validation: {
      min: 0.01,
      max: 9999.99,
      precision: 2
    }
  },

  // Diagnosis Information
  {
    id: 'primary_diagnosis',
    name: 'Primary Diagnosis',
    type: 'string',
    description: 'Primary ICD-10 diagnosis code',
    required: true,
    category: 'Diagnosis Information',
    validation: {
      pattern: '^[A-Z][0-9]{2}\\.[0-9]{1,2}$'
    }
  },
  {
    id: 'secondary_diagnosis',
    name: 'Secondary Diagnosis',
    type: 'string',
    description: 'Secondary ICD-10 diagnosis code',
    required: false,
    category: 'Diagnosis Information',
    validation: {
      pattern: '^[A-Z][0-9]{2}\\.[0-9]{1,2}$'
    }
  },

  // Financial Information
  {
    id: 'billed_amount',
    name: 'Billed Amount',
    type: 'decimal',
    description: 'Total amount billed by provider',
    required: true,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'allowed_amount',
    name: 'Allowed Amount',
    type: 'decimal',
    description: 'Allowed amount for the service',
    required: true,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'paid_amount',
    name: 'Paid Amount',
    type: 'decimal',
    description: 'Amount paid to provider',
    required: true,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'member_liability',
    name: 'Member Liability',
    type: 'decimal',
    description: 'Amount member is responsible for',
    required: true,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'copay_amount',
    name: 'Copay Amount',
    type: 'decimal',
    description: 'Member copay amount',
    required: false,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'coinsurance_amount',
    name: 'Coinsurance Amount',
    type: 'decimal',
    description: 'Member coinsurance amount',
    required: false,
    category: 'Financial Information',
    validation: standardValidations.amount
  },
  {
    id: 'deductible_amount',
    name: 'Deductible Amount',
    type: 'decimal',
    description: 'Amount applied to deductible',
    required: false,
    category: 'Financial Information',
    validation: standardValidations.amount
  },

  // Authorization Information
  {
    id: 'auth_number',
    name: 'Authorization Number',
    type: 'string',
    description: 'Prior authorization reference number',
    required: false,
    category: 'Authorization Information',
    validation: {
      pattern: '^AUTH[0-9]{8}$'
    }
  },
  {
    id: 'auth_status',
    name: 'Authorization Status',
    type: 'string',
    description: 'Status of prior authorization',
    required: false,
    category: 'Authorization Information',
    validation: {
      enum: ['Approved', 'Denied', 'Pending', 'Not Required']
    }
  }
];

export const eligibilityLibraryFields: StandardField[] = [
  ...baseMemberFields,
  // Coverage Information
  {
    id: 'effective_date',
    name: 'Effective Date',
    type: 'date',
    description: 'Coverage effective date',
    required: true,
    category: 'Coverage Information',
    validation: standardValidations.date
  },
  {
    id: 'termination_date',
    name: 'Termination Date',
    type: 'date',
    description: 'Coverage termination date',
    required: false,
    category: 'Coverage Information',
    validation: standardValidations.date
  },
  {
    id: 'coverage_status',
    name: 'Coverage Status',
    type: 'string',
    description: 'Current status of coverage',
    required: true,
    category: 'Coverage Information',
    validation: {
      enum: ['Active', 'Terminated', 'Future', 'Suspended']
    }
  },
  {
    id: 'coverage_type',
    name: 'Coverage Type',
    type: 'string',
    description: 'Type of coverage',
    required: true,
    category: 'Coverage Information',
    validation: {
      enum: ['Medical', 'Dental', 'Vision', 'Pharmacy']
    }
  },

  // Plan Information
  {
    id: 'plan_id',
    name: 'Plan ID',
    type: 'string',
    description: 'Unique identifier for the plan',
    required: true,
    category: 'Plan Information',
    validation: {
      pattern: '^PLN[0-9]{6}$'
    }
  },
  {
    id: 'plan_name',
    name: 'Plan Name',
    type: 'string',
    description: 'Name of the insurance plan',
    required: true,
    category: 'Plan Information',
    validation: {
      maxLength: 100
    }
  },
  // Plan Information (continued)
  {
    id: 'plan_type',
    name: 'Plan Type',
    type: 'string',
    description: 'Type of insurance plan',
    required: true,
    category: 'Plan Information',
    validation: {
      enum: ['HMO', 'PPO', 'EPO', 'POS', 'HDHP']
    }
  },
  {
    id: 'metal_level',
    name: 'Metal Level',
    type: 'string',
    description: 'ACA metal level of the plan',
    required: false,
    category: 'Plan Information',
    validation: {
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Catastrophic']
    }
  },
  {
    id: 'group_id',
    name: 'Group ID',
    type: 'string',
    description: 'Employer group identifier',
    required: true,
    category: 'Plan Information',
    validation: {
      pattern: '^GRP[0-9]{7}$'
    }
  },
  {
    id: 'group_name',
    name: 'Group Name',
    type: 'string',
    description: 'Name of employer group',
    required: true,
    category: 'Plan Information',
    validation: {
      maxLength: 100
    }
  },

  // Benefit Information
  {
    id: 'deductible_individual',
    name: 'Individual Deductible',
    type: 'decimal',
    description: 'Individual deductible amount',
    required: true,
    category: 'Benefit Information',
    validation: standardValidations.amount
  },
  {
    id: 'deductible_family',
    name: 'Family Deductible',
    type: 'decimal',
    description: 'Family deductible amount',
    required: true,
    category: 'Benefit Information',
    validation: standardValidations.amount
  },
  {
    id: 'oop_max_individual',
    name: 'Individual Out-of-Pocket Maximum',
    type: 'decimal',
    description: 'Individual out-of-pocket maximum',
    required: true,
    category: 'Benefit Information',
    validation: standardValidations.amount
  },
  {
    id: 'oop_max_family',
    name: 'Family Out-of-Pocket Maximum',
    type: 'decimal',
    description: 'Family out-of-pocket maximum',
    required: true,
    category: 'Benefit Information',
    validation: standardValidations.amount
  },
  {
    id: 'primary_copay',
    name: 'PCP Copay',
    type: 'decimal',
    description: 'Primary care physician copay amount',
    required: false,
    category: 'Benefit Information',
    validation: standardValidations.amount
  },
  {
    id: 'specialist_copay',
    name: 'Specialist Copay',
    type: 'decimal',
    description: 'Specialist copay amount',
    required: false,
    category: 'Benefit Information',
    validation: standardValidations.amount
  },

  // Network Information
  {
    id: 'network_id',
    name: 'Network ID',
    type: 'string',
    description: 'Provider network identifier',
    required: true,
    category: 'Network Information',
    validation: {
      pattern: '^NET[0-9]{6}$'
    }
  },
  {
    id: 'network_name',
    name: 'Network Name',
    type: 'string',
    description: 'Name of provider network',
    required: true,
    category: 'Network Information',
    validation: {
      maxLength: 100
    }
  },
  {
    id: 'network_tier',
    name: 'Network Tier',
    type: 'string',
    description: 'Network tier level',
    required: false,
    category: 'Network Information',
    validation: {
      enum: ['Preferred', 'Standard', 'Out-of-Network']
    }
  },

  // Dependent Information
  {
    id: 'relationship_code',
    name: 'Relationship Code',
    type: 'string',
    description: 'Relationship to subscriber',
    required: true,
    category: 'Dependent Information',
    validation: {
      enum: ['Self', 'Spouse', 'Child', 'Other']
    }
  },
  {
    id: 'dependent_sequence',
    name: 'Dependent Sequence',
    type: 'number',
    description: 'Sequence number for dependent',
    required: false,
    category: 'Dependent Information',
    validation: {
      min: 1,
      max: 99
    }
  }
];

export const wellnessLibraryFields: StandardField[] = [
  ...baseMemberFields,
  // Program Information
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
    id: 'program_name',
    name: 'Program Name',
    type: 'string',
    description: 'Name of wellness program',
    required: true,
    category: 'Program Information',
    validation: {
      maxLength: 100
    }
  },
  {
    id: 'enrollment_date',
    name: 'Enrollment Date',
    type: 'date',
    description: 'Date of program enrollment',
    required: true,
    category: 'Program Information',
    validation: standardValidations.date
  },
  {
    id: 'program_status',
    name: 'Program Status',
    type: 'string',
    description: 'Current program status',
    required: true,
    category: 'Program Information',
    validation: {
      enum: ['Active', 'Completed', 'Withdrawn', 'On Hold']
    }
  },

  // Activity Information
  {
    id: 'activity_id',
    name: 'Activity ID',
    type: 'string',
    description: 'Unique identifier for activity',
    required: true,
    category: 'Activity Information',
    validation: {
      pattern: '^ACT[0-9]{8}$'
    }
  },
  {
    id: 'activity_type',
    name: 'Activity Type',
    type: 'string',
    description: 'Type of wellness activity',
    required: true,
    category: 'Activity Information',
    validation: {
      enum: [
        'Health Assessment',
        'Biometric Screening',
        'Physical Activity',
        'Nutrition',
        'Stress Management',
        'Tobacco Cessation',
        'Preventive Care',
        'Health Coaching'
      ]
    }
  },
  {
    id: 'activity_date',
    name: 'Activity Date',
    type: 'date',
    description: 'Date activity was performed',
    required: true,
    category: 'Activity Information',
    validation: standardValidations.date
  },
  {
    id: 'completion_status',
    name: 'Completion Status',
    type: 'string',
    description: 'Status of activity completion',
    required: true,
    category: 'Activity Information',
    validation: {
      enum: ['Not Started', 'In Progress', 'Completed', 'Expired']
    }
  },

  // Biometric Information
  {
    id: 'height',
    name: 'Height (inches)',
    type: 'number',
    description: 'Member height in inches',
    required: false,
    category: 'Biometric Information',
    validation: {
      min: 36,
      max: 96,
      precision: 1
    }
  },
  {
    id: 'weight',
    name: 'Weight (lbs)',
    type: 'number',
    description: 'Member weight in pounds',
    required: false,
    category: 'Biometric Information',
    validation: {
      min: 50,
      max: 500,
      precision: 1
    }
  },
  {
    id: 'bmi',
    name: 'BMI',
    type: 'decimal',
    description: 'Body Mass Index',
    required: false,
    category: 'Biometric Information',
    validation: {
      min: 10,
      max: 50,
      precision: 1
    }
  },
  {
    id: 'blood_pressure_systolic',
    name: 'Blood Pressure Systolic',
    type: 'number',
    description: 'Systolic blood pressure reading',
    required: false,
    category: 'Biometric Information',
    validation: {
      min: 70,
      max: 200
    }
  },
  {
    id: 'blood_pressure_diastolic',
    name: 'Blood Pressure Diastolic',
    type: 'number',
    description: 'Diastolic blood pressure reading',
    required: false,
    category: 'Biometric Information',
    validation: {
      min: 40,
      max: 130
    }
  },

  // Assessment Information
  {
    id: 'assessment_score',
    name: 'Health Assessment Score',
    type: 'number',
    description: 'Overall health assessment score',
    required: false,
    category: 'Assessment Information',
    validation: {
      min: 0,
      max: 100
    }
  },
  {
    id: 'risk_level',
    name: 'Health Risk Level',
    type: 'string',
    description: 'Assessed health risk level',
    required: false,
    category: 'Assessment Information',
    validation: {
      enum: ['Low', 'Moderate', 'High']
    }
  },

  // Incentive Information
  {
    id: 'points_earned',
    name: 'Points Earned',
    type: 'number',
    description: 'Total wellness points earned',
    required: false,
    category: 'Incentive Information',
    validation: {
      min: 0,
      max: 10000
    }
  },
  {
    id: 'incentive_amount',
    name: 'Incentive Amount',
    type: 'decimal',
    description: 'Monetary incentive earned',
    required: false,
    category: 'Incentive Information',
    validation: standardValidations.amount
  },
  {
    id: 'reward_status',
    name: 'Reward Status',
    type: 'string',
    description: 'Status of incentive reward',
    required: false,
    category: 'Incentive Information',
    validation: {
      enum: ['Earned', 'Pending', 'Paid', 'Forfeited']
    }
  },

  // Progress Information
  {
    id: 'goal_type',
    name: 'Goal Type',
    type: 'string',
    description: 'Type of wellness goal',
    required: false,
    category: 'Progress Information',
    validation: {
      enum: ['Weight Loss', 'Physical Activity', 'Nutrition', 'Stress Management', 'Sleep']
    }
  },
  {
    id: 'goal_target',
    name: 'Goal Target',
    type: 'string',
    description: 'Target value for goal',
    required: false,
    category: 'Progress Information',
    validation: {
      maxLength: 50
    }
  },
  {
    id: 'goal_progress',
    name: 'Goal Progress',
    type: 'number',
    description: 'Progress towards goal (percentage)',
    required: false,
    category: 'Progress Information',
    validation: {
      min: 0,
      max: 100
    }
  }
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