// src/features/layouts/mockData.ts
import { Layout, Field, FieldType, LayoutStatus, LayoutFormValues } from './types';

const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Common fields that might be shared across different layouts
const commonFields: Field[] = [
  {
    id: generateId(),
    name: 'createdAt',
    type: 'date',
    required: true,
    description: 'Record creation timestamp'
  },
  {
    id: generateId(),
    name: 'lastModified',
    type: 'date',
    required: true,
    description: 'Last modification timestamp'
  }
];

// Claims-specific fields
const claimsFields: Field[] = [
  {
    id: generateId(),
    name: 'claimId',
    type: 'string',
    required: true,
    description: 'Unique identifier for the claim'
  },
  {
    id: generateId(),
    name: 'memberId',
    type: 'string',
    required: true,
    description: 'Member identifier'
  },
  {
    id: generateId(),
    name: 'providerId',
    type: 'string',
    required: true,
    description: 'Provider identifier'
  },
  {
    id: generateId(),
    name: 'serviceDate',
    type: 'date',
    required: true,
    description: 'Date of service'
  },
  {
    id: generateId(),
    name: 'procedureCode',
    type: 'string',
    required: true,
    description: 'Procedure code (CDT/CPT)'
  },
  {
    id: generateId(),
    name: 'billedAmount',
    type: 'decimal',
    required: true,
    description: 'Amount billed by provider'
  },
  {
    id: generateId(),
    name: 'allowedAmount',
    type: 'decimal',
    required: true,
    description: 'Allowed amount for the service'
  },
  {
    id: generateId(),
    name: 'paidAmount',
    type: 'decimal',
    required: true,
    description: 'Amount paid for the service'
  },
  {
    id: generateId(),
    name: 'isAdjustment',
    type: 'boolean',
    required: false,
    description: 'Indicates if this is a claim adjustment'
  }
];

// Eligibility-specific fields
const eligibilityFields: Field[] = [
  {
    id: generateId(),
    name: 'subscriberId',
    type: 'string',
    required: true,
    description: 'Subscriber identifier'
  },
  {
    id: generateId(),
    name: 'firstName',
    type: 'string',
    required: true,
    description: 'Member first name'
  },
  {
    id: generateId(),
    name: 'lastName',
    type: 'string',
    required: true,
    description: 'Member last name'
  },
  {
    id: generateId(),
    name: 'dateOfBirth',
    type: 'date',
    required: true,
    description: 'Member date of birth'
  },
  {
    id: generateId(),
    name: 'effectiveDate',
    type: 'date',
    required: true,
    description: 'Coverage effective date'
  },
  {
    id: generateId(),
    name: 'terminationDate',
    type: 'date',
    required: false,
    description: 'Coverage termination date'
  },
  {
    id: generateId(),
    name: 'planCode',
    type: 'string',
    required: true,
    description: 'Dental plan code'
  },
  {
    id: generateId(),
    name: 'groupNumber',
    type: 'string',
    required: true,
    description: 'Group/employer number'
  }
];

// Provider-specific fields
const providerFields: Field[] = [
  {
    id: generateId(),
    name: 'npi',
    type: 'string',
    required: true,
    description: 'National Provider Identifier'
  },
  {
    id: generateId(),
    name: 'taxId',
    type: 'string',
    required: true,
    description: 'Tax identification number'
  },
  {
    id: generateId(),
    name: 'providerName',
    type: 'string',
    required: true,
    description: 'Provider name'
  },
  {
    id: generateId(),
    name: 'specialty',
    type: 'string',
    required: true,
    description: 'Provider specialty'
  },
  {
    id: generateId(),
    name: 'addressLine1',
    type: 'string',
    required: true,
    description: 'Practice address line 1'
  },
  {
    id: generateId(),
    name: 'city',
    type: 'string',
    required: true,
    description: 'Practice city'
  },
  {
    id: generateId(),
    name: 'state',
    type: 'string',
    required: true,
    description: 'Practice state'
  },
  {
    id: generateId(),
    name: 'zipCode',
    type: 'string',
    required: true,
    description: 'Practice ZIP code'
  }
];

export const mockLayouts: Layout[] = [
  {
    id: generateId(),
    name: 'Claims Extract v1.0',
    description: 'Standard claims extract including payment and procedure information',
    status: 'active',
    version: 1,
    lastModified: '2024-01-15T08:00:00Z',
    fields: [...claimsFields, ...commonFields]
  },
  {
    id: generateId(),
    name: 'Claims Extract v2.0',
    description: 'Enhanced claims extract with additional payment details',
    status: 'draft',
    version: 2,
    lastModified: '2024-02-20T10:30:00Z',
    fields: [
      ...claimsFields,
      {
        id: generateId(),
        name: 'networkStatus',
        type: 'string',
        required: true,
        description: 'Provider network status'
      },
      ...commonFields
    ]
  },
  {
    id: generateId(),
    name: 'Eligibility Basic',
    description: 'Basic member eligibility information',
    status: 'active',
    version: 1,
    lastModified: '2024-01-10T14:15:00Z',
    fields: [...eligibilityFields, ...commonFields]
  },
  {
    id: generateId(),
    name: 'Provider Directory',
    description: 'Complete provider information for directory purposes',
    status: 'active',
    version: 1,
    lastModified: '2024-01-05T11:20:00Z',
    fields: [...providerFields, ...commonFields]
  },
  {
    id: generateId(),
    name: 'Provider Network',
    description: 'Provider network and contracting information',
    status: 'pending',
    version: 1,
    lastModified: '2024-02-28T09:45:00Z',
    fields: [
      ...providerFields,
      {
        id: generateId(),
        name: 'contractEffectiveDate',
        type: 'date',
        required: true,
        description: 'Contract effective date'
      },
      {
        id: generateId(),
        name: 'contractTerminationDate',
        type: 'date',
        required: false,
        description: 'Contract termination date'
      },
      {
        id: generateId(),
        name: 'networkTier',
        type: 'string',
        required: true,
        description: 'Provider network tier'
      },
      ...commonFields
    ]
  }
];

// Sample new layout form values
export const sampleLayoutFormValues: LayoutFormValues = {
  name: 'New Claims Extract',
  description: 'Standard claims extract for payment processing',
  fields: [
    {
      name: 'claimId',
      type: 'string',
      required: true,
      description: 'Unique claim identifier'
    },
    {
      name: 'serviceDate',
      type: 'date',
      required: true,
      description: 'Date of service'
    },
    {
      name: 'amount',
      type: 'decimal',
      required: true,
      description: 'Claim amount'
    }
  ]
};