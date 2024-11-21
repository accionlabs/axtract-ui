// src/features/sources/mockData/queries.ts

import { 
    QueryDefinition, 
    QueryResult,
    ValidationMessage, 
    QueryValidation,
    Field
  } from '../types';
  
  // Sample fields with metadata
  export const fieldMetadata: Record<string, Field[]> = {
    claims: [
      { name: 'claim_id', type: 'string', source: 's1', table: 'claims', description: 'Unique claim identifier' },
      { name: 'member_id', type: 'string', source: 's1', table: 'claims', description: 'Member identifier' },
      { name: 'service_date', type: 'date', source: 's1', table: 'claims', description: 'Date of service' },
      { name: 'provider_id', type: 'string', source: 's1', table: 'claims', description: 'Provider identifier' },
      { name: 'diagnosis_code', type: 'string', source: 's1', table: 'claims', description: 'ICD-10 diagnosis code' },
      { name: 'procedure_code', type: 'string', source: 's1', table: 'claims', description: 'CPT/HCPCS procedure code' },
      { name: 'billed_amount', type: 'decimal', source: 's1', table: 'claims', description: 'Total billed amount' },
      { name: 'allowed_amount', type: 'decimal', source: 's1', table: 'claims', description: 'Allowed amount' },
      { name: 'paid_amount', type: 'decimal', source: 's1', table: 'claims', description: 'Paid amount' },
      { name: 'member_liability', type: 'decimal', source: 's1', table: 'claims', description: 'Member responsibility' }
    ],
    members: [
      { name: 'member_id', type: 'string', source: 's2', table: 'members', description: 'Member identifier' },
      { name: 'first_name', type: 'string', source: 's2', table: 'members', description: 'Member first name' },
      { name: 'last_name', type: 'string', source: 's2', table: 'members', description: 'Member last name' },
      { name: 'date_of_birth', type: 'date', source: 's2', table: 'members', description: 'Date of birth' },
      { name: 'gender', type: 'string', source: 's2', table: 'members', description: 'Member gender' },
      { name: 'enrollment_date', type: 'date', source: 's2', table: 'members', description: 'Coverage start date' },
      { name: 'termination_date', type: 'date', source: 's2', table: 'members', description: 'Coverage end date' },
      { name: 'plan_id', type: 'string', source: 's2', table: 'members', description: 'Plan identifier' },
      { name: 'group_id', type: 'string', source: 's2', table: 'members', description: 'Group identifier' }
    ],
    providers: [
      { name: 'provider_id', type: 'string', source: 's3', table: 'providers', description: 'Provider identifier' },
      { name: 'npi', type: 'string', source: 's3', table: 'providers', description: 'National Provider Identifier' },
      { name: 'first_name', type: 'string', source: 's3', table: 'providers', description: 'Provider first name' },
      { name: 'last_name', type: 'string', source: 's3', table: 'providers', description: 'Provider last name' },
      { name: 'specialty', type: 'string', source: 's3', table: 'providers', description: 'Provider specialty' },
      { name: 'network_status', type: 'string', source: 's3', table: 'providers', description: 'Network participation status' },
      { name: 'effective_date', type: 'date', source: 's3', table: 'providers', description: 'Network effective date' },
      { name: 'termination_date', type: 'date', source: 's3', table: 'providers', description: 'Network termination date' }
    ]
  };
  
  // Sample queries with rich metadata
  export const mockQueries: QueryDefinition[] = [
    {
      id: 'query-1',
      name: 'Claims with Member Data',
      description: 'Claims data joined with member demographics',
      sources: [
        { sourceId: 'claims-db', alias: 's1', table: 'claims' },
        { sourceId: 'member-data', alias: 's2', table: 'members' }
      ],
      selectedFields: [
        fieldMetadata.claims.find(f => f.name === 'claim_id')!,
        fieldMetadata.claims.find(f => f.name === 'service_date')!,
        fieldMetadata.claims.find(f => f.name === 'paid_amount')!,
        fieldMetadata.members.find(f => f.name === 'member_id')!,
        fieldMetadata.members.find(f => f.name === 'first_name')!,
        fieldMetadata.members.find(f => f.name === 'last_name')!
      ],
      joins: [
        {
          leftField: fieldMetadata.claims.find(f => f.name === 'member_id')!,
          rightField: fieldMetadata.members.find(f => f.name === 'member_id')!,
          type: 'INNER'
        }
      ],
      filters: [],
      createdAt: new Date(2024, 2, 1).toISOString(),
      updatedAt: new Date(2024, 2, 15).toISOString()
    },
    {
      id: 'query-2',
      name: 'Provider Network Analysis',
      description: 'Claims analysis by provider network status',
      sources: [
        { sourceId: 'claims-db', alias: 's1', table: 'claims' },
        { sourceId: 'provider-data', alias: 's3', table: 'providers' }
      ],
      selectedFields: [
        fieldMetadata.providers.find(f => f.name === 'provider_id')!,
        fieldMetadata.claims.find(f => f.name === 'paid_amount')!,
        fieldMetadata.providers.find(f => f.name === 'first_name')!,
        fieldMetadata.providers.find(f => f.name === 'last_name')!,
        fieldMetadata.providers.find(f => f.name === 'specialty')!,
        fieldMetadata.providers.find(f => f.name === 'network_status')!
      ],
      joins: [
        {
          leftField: fieldMetadata.claims.find(f => f.name === 'provider_id')!,
          rightField: fieldMetadata.providers.find(f => f.name === 'provider_id')!,
          type: 'INNER'
        }
      ],
      filters: [],
      createdAt: new Date(2024, 2, 10).toISOString(),
      updatedAt: new Date(2024, 2, 16).toISOString()
    }
  ];
  
  // Sample query results
  export const mockQueryResults: Record<string, QueryResult> = {
    'query-1': {
      columns: [
        { name: 'claim_id', type: 'string' },
        { name: 'service_date', type: 'date' },
        { name: 'paid_amount', type: 'decimal' },
        { name: 'member_id', type: 'string' },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' }
      ],
      rows: [
        {
          claim_id: 'CLM001234',
          service_date: '2024-03-15',
          paid_amount: 100.00,
          member_id: 'MEM789012',
          first_name: 'John',
          last_name: 'Smith'
        },
        {
          claim_id: 'CLM001235',
          service_date: '2024-03-16',
          paid_amount: 140.00,
          member_id: 'MEM789012',
          first_name: 'John',
          last_name: 'Smith'
        }
      ],
      totalRows: 2,
      executionTime: 1.5
    },
    'query-2': {
      columns: [
        { name: 'provider_id', type: 'string' },
        { name: 'paid_amount', type: 'decimal' },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'specialty', type: 'string' },
        { name: 'network_status', type: 'string' }
      ],
      rows: [
        {
          provider_id: 'PRV456789',
          paid_amount: 100.00,
          first_name: 'Jane',
          last_name: 'Doe',
          specialty: 'Family Medicine',
          network_status: 'In-Network'
        }
      ],
      totalRows: 1,
      executionTime: 0.8
    }
  };
  
  // Sample validation results
  export const mockValidations: Record<string, QueryValidation> = {
    'query-1': {
      isValid: true,
      messages: [],
      timestamp: new Date().toISOString()
    },
    'query-2': {
      isValid: true,
      messages: [
        {
          code: 'PERFORMANCE_WARNING',
          message: 'Consider adding filters to improve query performance',
          severity: 'warning',
          context: { estimatedRows: 10000 }
        } as ValidationMessage
      ],
      timestamp: new Date().toISOString()
    },
    'new-query': {
      isValid: false,
      messages: [
        {
          code: 'NO_FIELDS',
          message: 'Query must include at least one field',
          severity: 'error'
        } as ValidationMessage
      ],
      timestamp: new Date().toISOString()
    }
  };
  
  // Query templates for common scenarios
  export const queryTemplates = [
    {
      id: 'template-1',
      name: 'Claims Analysis',
      description: 'Common claims analysis templates',
      templates: [
        {
          name: 'Basic Claims Report',
          description: 'Claims with member and provider details',
          sourceTypes: ['claims', 'members', 'providers'],
          defaultFields: [
            'claim_id',
            'service_date',
            'paid_amount',
            'member_id',
            'provider_id'
          ]
        },
        {
          name: 'Network Analysis',
          description: 'Claims by provider network status',
          sourceTypes: ['claims', 'providers'],
          defaultFields: [
            'provider_id',
            'specialty',
            'network_status',
            'paid_amount'
          ]
        }
      ]
    },
    {
      id: 'template-2',
      name: 'Member Reports',
      description: 'Member-focused report templates',
      templates: [
        {
          name: 'Member Demographics',
          description: 'Basic member information',
          sourceTypes: ['members'],
          defaultFields: [
            'member_id',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender'
          ]
        },
        {
          name: 'Member Claims History',
          description: 'Claims history for members',
          sourceTypes: ['members', 'claims'],
          defaultFields: [
            'member_id',
            'first_name',
            'last_name',
            'claim_id',
            'service_date',
            'paid_amount'
          ]
        }
      ]
    }
  ];