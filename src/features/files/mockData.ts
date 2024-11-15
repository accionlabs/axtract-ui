// src/features/files/mockData.ts

import { FileConfiguration } from './types';

import { LAYOUT_IDS } from '../layouts/mockData';

// Helper to generate dates
const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Sample file configurations
export const mockFiles: FileConfiguration[] = [
  {
    id: 'file-1',
    name: 'Claims Data Extract',
    layoutId: LAYOUT_IDS.CLAIMS,
    format: 'CSV',
    status: 'active',
    createdAt: getPastDate(30),
    updatedAt: getPastDate(5),
    deliveryConfig: {
      type: 'sftp',
      sftp: {
        host: 'sftp.claims.example.com',
        port: 22,
        username: 'claims_user',
        path: '/uploads/claims',
        knownHostKey: 'ssh-rsa AAAAB3NzaC1...'
      }
    },
    scheduleConfig: {
      frequency: 'daily',
      time: '23:00',
      timezone: 'America/Los_Angeles',
      daysOfWeek: undefined,
      daysOfMonth: undefined
    },
    notificationConfig: {
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notificationEmails: ['claims@company.com', 'operations@company.com'],
      retryConfig: {
        maxAttempts: 3,
        delayMinutes: 15
      }
    }
  },
  {
    id: 'file-2',
    name: 'Provider Summary Report',
    layoutId: LAYOUT_IDS.ELIGIBILITY,
    format: 'JSON',
    status: 'active',
    createdAt: getPastDate(60),
    updatedAt: getPastDate(2),
    deliveryConfig: {
      type: 'api',
      api: {
        method: 'POST',
        url: 'https://api.providers.example.com/v1/data',
        headers: {
          'Authorization': 'Bearer ${env:API_TOKEN}',
          'Content-Type': 'application/json',
          'X-Source': 'AxTract'
        },
        validateSsl: true,
        timeout: 120,
        retryStrategy: {
          maxRetries: 3,
          backoffMultiplier: 2
        }
      }
    },
    scheduleConfig: {
      frequency: 'weekly',
      time: '01:00',
      timezone: 'America/New_York',
      daysOfWeek: [1], // Monday
      daysOfMonth: undefined
    },
    encryptionConfig: {
      enabled: true,
      type: 'PGP',
      publicKey: '-----BEGIN PGP PUBLIC KEY-----\nVersion: 1\n...'
    },
    notificationConfig: {
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notificationEmails: ['providers@company.com'],
      retryConfig: {
        maxAttempts: 2,
        delayMinutes: 30
      }
    }
  },
  {
    id: 'file-3',
    name: 'Monthly Financial Report',
    layoutId: LAYOUT_IDS.CLAIMS,
    format: 'CSV',
    status: 'active',
    createdAt: getPastDate(90),
    updatedAt: getPastDate(1),
    deliveryConfig: {
      type: 'database',
      database: {
        type: 'postgresql',
        host: 'db.analytics.example.com',
        port: 5432,
        name: 'analytics_db',
        username: 'etl_user',
        schema: 'financial_reports',
        table: 'monthly_claims_summary',
        writeMode: 'replace',
        batchSize: 1000,
        connectionTimeout: 60
      }
    },
    scheduleConfig: {
      frequency: 'monthly',
      time: '04:00',
      timezone: 'UTC',
      daysOfMonth: [1]
    },
    notificationConfig: {
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notificationEmails: ['finance@company.com', 'accounting@company.com'],
      retryConfig: {
        maxAttempts: 5,
        delayMinutes: 20
      }
    }
  },
  {
    id: 'file-4',
    name: 'Member Updates',
    layoutId: LAYOUT_IDS.ELIGIBILITY,
    format: 'JSON',
    status: 'draft',
    createdAt: getPastDate(5),
    updatedAt: getPastDate(1),
    deliveryConfig: {
      type: 'api',
      api: {
        method: 'PUT',
        url: 'https://api.membership.example.com/v2/batch',
        headers: {
          'Authorization': 'ApiKey ${env:MEMBER_API_KEY}',
          'Content-Type': 'application/json'
        },
        validateSsl: true,
        timeout: 180,
        retryStrategy: {
          maxRetries: 3,
          backoffMultiplier: 1.5
        }
      }
    },
    notificationConfig: {
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notificationEmails: ['membership@company.com'],
      retryConfig: {
        maxAttempts: 3,
        delayMinutes: 10
      }
    }
  },
  {
    id: 'file-5',
    name: 'Wellness Program Extract',
    layoutId: LAYOUT_IDS.WELLNESS,
    format: 'TSV',
    status: 'active',
    createdAt: getPastDate(45),
    updatedAt: getPastDate(3),
    deliveryConfig: {
      type: 'database',
      database: {
        type: 'sqlserver',
        host: 'sql.wellness.example.com',
        port: 1433,
        name: 'WELLNESS_DB',
        username: 'etl_wellness',
        schema: 'dbo',
        table: 'WELLNESS_ACTIVITIES',
        writeMode: 'upsert',
        batchSize: 500,
        connectionTimeout: 30
      }
    },
    scheduleConfig: {
      frequency: 'weekly',
      time: '22:00',
      timezone: 'America/Chicago',
      daysOfWeek: [5], // Friday
      daysOfMonth: undefined
    },
    encryptionConfig: {
      enabled: true,
      type: 'PGP',
      publicKey: '-----BEGIN PGP PUBLIC KEY-----\nVersion: 1\n...'
    },
    notificationConfig: {
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notificationEmails: ['wellness@company.com', 'operations@company.com'],
      retryConfig: {
        maxAttempts: 3,
        delayMinutes: 15
      }
    }
  }
];

// Common timezones for select dropdown
export const timezoneOptions = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'UTC', label: 'UTC' }
];

// Week days for select dropdown
export const weekDayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

// Helper function to get day of month suffix (1st, 2nd, 3rd, etc.)
function getDayOfMonthSuffix(day: number) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Month days for select dropdown (1-31)
export const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getDayOfMonthSuffix(i + 1)}`
}));

// Database specific options
export const databaseOptions = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' }
];

export const writeModeOptions = [
  { value: 'insert', label: 'Insert Only' },
  { value: 'upsert', label: 'Upsert (Insert/Update)' },
  { value: 'replace', label: 'Replace Existing' }
];

// HTTP method options
export const httpMethodOptions = [
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' }
];

// Default configurations
export const defaultApiConfig = {
  method: 'POST' as const,
  validateSsl: true,
  timeout: 60,
  retryStrategy: {
    maxRetries: 3,
    backoffMultiplier: 2
  }
};

export const defaultDatabaseConfig = {
  port: {
    postgresql: 5432,
    mysql: 3306,
    sqlserver: 1433,
    oracle: 1521
  },
  batchSize: 1000,
  connectionTimeout: 30
};

export const defaultSftpConfig = {
  port: 22
};