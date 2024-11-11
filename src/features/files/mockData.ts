// src/features/files/mockData.ts

import { FileConfiguration } from './types';

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
    layoutId: 'layout-1',
    format: 'CSV',
    status: 'active',
    createdAt: getPastDate(30),
    updatedAt: getPastDate(5),
    sftpConfig: {
      host: 'sftp.claims.example.com',
      port: 22,
      username: 'claims_user',
      path: '/uploads/claims',
      knownHostKey: 'ssh-rsa AAAAB3NzaC1...'
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
    layoutId: 'layout-2',
    format: 'TSV',
    status: 'active',
    createdAt: getPastDate(60),
    updatedAt: getPastDate(2),
    sftpConfig: {
      host: 'sftp.providers.example.com',
      port: 22,
      username: 'provider_user',
      path: '/reports'
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
    layoutId: 'layout-3',
    format: 'FIXED',
    status: 'inactive',
    createdAt: getPastDate(90),
    updatedAt: getPastDate(1),
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
    layoutId: 'layout-4',
    format: 'CSV',
    status: 'draft',
    createdAt: getPastDate(5),
    updatedAt: getPastDate(1),
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
    layoutId: 'layout-5',
    format: 'CSV',
    status: 'active',
    createdAt: getPastDate(45),
    updatedAt: getPastDate(3),
    sftpConfig: {
      host: 'sftp.wellness.example.com',
      port: 22,
      username: 'wellness_user',
      path: '/extracts/wellness'
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
  if (day >= 11 && day <= 13) {
    return 'th';
  }
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