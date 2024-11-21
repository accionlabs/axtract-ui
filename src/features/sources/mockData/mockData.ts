// src/features/sources/mockData/mockData.ts

import { DataSource, DatabaseConfig, FileConfig, ApiConfig } from '../types';

const dbConfig: DatabaseConfig = {
  type: 'postgresql',
  host: 'prod-claims-db.example.com',
  port: 5432,
  database: 'claims_prod',
  schema: 'public',
  username: 'claims_reader',
  password: '********'
};

const fileConfig: FileConfig = {
  type: 'csv',
  location: '/data/feeds/provider',
  delimiter: ',',
  encoding: 'UTF-8',
  hasHeader: true
};

const apiConfig: ApiConfig = {
  url: 'https://api.eligibility.example.com/v1',
  method: 'POST',
  authentication: {
    type: 'bearer',
    credentials: {
      token: '********'
    }
  }
};

// Updated mock data with proper table and field metadata
export const mockDataSources: DataSource[] = [
  {
    id: 'claims-db',
    name: 'Claims Database',
    description: 'Production claims database',
    type: 'database',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    lastTestAt: '2024-03-19T10:00:00Z',
    connectionDetails: dbConfig,
    metadata: {
      tables: [
        {
          name: 'claims',
          schema: 'public',
          fields: [
            { name: 'claim_id', type: 'string', nullable: false },
            { name: 'member_id', type: 'string', nullable: false },
            { name: 'service_date', type: 'date', nullable: false },
            { name: 'provider_id', type: 'string', nullable: false },
            { name: 'diagnosis_code', type: 'string', nullable: false },
            { name: 'procedure_code', type: 'string', nullable: false },
            { name: 'billed_amount', type: 'decimal', nullable: false },
            { name: 'allowed_amount', type: 'decimal', nullable: false },
            { name: 'paid_amount', type: 'decimal', nullable: false },
            { name: 'member_liability', type: 'decimal', nullable: false }
          ]
        }
      ]
    }
  },
  {
    id: 'member-data',
    name: 'Member Database',
    description: 'Member eligibility and demographics',
    type: 'database',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    lastTestAt: '2024-03-19T10:00:00Z',
    connectionDetails: {
      ...dbConfig,
      database: 'member_data'
    },
    metadata: {
      tables: [
        {
          name: 'members',
          schema: 'public',
          fields: [
            { name: 'member_id', type: 'string', nullable: false },
            { name: 'first_name', type: 'string', nullable: false },
            { name: 'last_name', type: 'string', nullable: false },
            { name: 'date_of_birth', type: 'date', nullable: false },
            { name: 'gender', type: 'string', nullable: false },
            { name: 'enrollment_date', type: 'date', nullable: false },
            { name: 'termination_date', type: 'date', nullable: true },
            { name: 'plan_id', type: 'string', nullable: false },
            { name: 'group_id', type: 'string', nullable: false }
          ]
        }
      ]
    }
  },
  {
    id: 'provider-data',
    name: 'Provider Feed',
    description: 'Provider network and roster data',
    type: 'file',
    status: 'active',
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
    connectionDetails: fileConfig,
    metadata: {
      tables: [
        {
          name: 'providers',
          schema: 'public',
          fields: [
            { name: 'provider_id', type: 'string', nullable: false },
            { name: 'npi', type: 'string', nullable: false },
            { name: 'first_name', type: 'string', nullable: false },
            { name: 'last_name', type: 'string', nullable: false },
            { name: 'specialty', type: 'string', nullable: false },
            { name: 'network_status', type: 'string', nullable: false },
            { name: 'effective_date', type: 'date', nullable: false },
            { name: 'termination_date', type: 'date', nullable: true }
          ]
        }
      ]
    }
  },
  {
    id: 'eligibility-api',
    name: 'Eligibility API',
    description: 'Real-time eligibility verification',
    type: 'api',
    status: 'active',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    lastTestAt: '2024-03-19T09:45:00Z',
    connectionDetails: apiConfig,
    metadata: {
      tables: [
        {
          name: 'eligibility',
          schema: 'public',
          fields: [
            { name: 'member_id', type: 'string', nullable: false },
            { name: 'verified_date', type: 'date', nullable: false },
            { name: 'status', type: 'string', nullable: false },
            { name: 'plan_type', type: 'string', nullable: false },
            { name: 'copay_amount', type: 'decimal', nullable: true },
            { name: 'deductible_amount', type: 'decimal', nullable: true },
            { name: 'out_of_pocket_max', type: 'decimal', nullable: true }
          ]
        }
      ]
    }
  }
];

// Sample preview data for query results
export const samplePreviewData: Record<string, any[]> = {
  claims: [
    {
      claim_id: 'CLM001234',
      member_id: 'MEM789012',
      service_date: '2024-03-15',
      provider_id: 'PRV456789',
      diagnosis_code: 'J20.9',
      procedure_code: '99213',
      billed_amount: 150.00,
      allowed_amount: 125.00,
      paid_amount: 100.00,
      member_liability: 25.00
    },
    {
      claim_id: 'CLM001235',
      member_id: 'MEM789012',
      service_date: '2024-03-16',
      provider_id: 'PRV456789',
      diagnosis_code: 'J45.901',
      procedure_code: '99214',
      billed_amount: 200.00,
      allowed_amount: 175.00,
      paid_amount: 140.00,
      member_liability: 35.00
    }
  ],
  members: [
    {
      member_id: 'MEM789012',
      first_name: 'John',
      last_name: 'Smith',
      date_of_birth: '1985-06-15',
      gender: 'M',
      enrollment_date: '2024-01-01',
      plan_id: 'PLN123',
      group_id: 'GRP456'
    }
  ],
  providers: [
    {
      provider_id: 'PRV456789',
      npi: '1234567890',
      first_name: 'Jane',
      last_name: 'Doe',
      specialty: 'Family Medicine',
      network_status: 'In-Network',
      effective_date: '2023-01-01'
    }
  ]
};