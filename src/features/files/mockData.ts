// src/features/files/mockData.ts

import { FileConfiguration } from './types';
import { mockLayouts } from '@/features/layouts/mockData';

// Helper to generate past date
const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Get layout IDs - now we don't filter by status
const getLayoutIdByType = (type: 'claims' | 'eligibility' | 'wellness') => {
  const layout = mockLayouts.find(layout => layout.type === type);
  return layout?.id || '';
};

export const mockFiles: FileConfiguration[] = [
  {
    id: 'file-1',
    name: 'Claims Data Extract',
    layoutId: getLayoutIdByType('claims'),
    format: 'CSV',
    status: 'active', // This should be active because claims layout is active
    createdAt: getPastDate(30),
    updatedAt: getPastDate(5),
    sftpConfig: {
      host: 'sftp.vendor.com',
      port: 22,
      username: 'claims_user',
      path: '/uploads/claims',
      knownHostKey: 'ssh-rsa AAAAB3NzaC1...'
    },
    scheduleConfig: {
      frequency: 'daily',
      time: '23:00',
      timezone: 'America/Los_Angeles'
    },
    encryptionConfig: {
      enabled: true,
      type: 'PGP',
      publicKey: '-----BEGIN PGP PUBLIC KEY-----\nVersion: 1\n-----END PGP PUBLIC KEY-----'
    }
  },
  {
    id: 'file-2',
    name: 'Provider Summary Report',
    layoutId: getLayoutIdByType('claims'),
    format: 'TSV',
    status: 'draft', // In draft by choice
    createdAt: getPastDate(15),
    updatedAt: getPastDate(2),
    scheduleConfig: {
      frequency: 'weekly',
      time: '01:00',
      timezone: 'America/New_York',
      daysOfWeek: [1] // Monday
    }
  },
  {
    id: 'file-3',
    name: 'Member Eligibility Data',
    layoutId: getLayoutIdByType('eligibility'),
    format: 'FIXED',
    status: 'active', // This should be active because eligibility layout is active
    createdAt: getPastDate(10),
    updatedAt: getPastDate(1),
    sftpConfig: {
      host: 'sftp.eligibility.com',
      port: 22,
      username: 'elig_user',
      path: '/data/incoming'
    },
    scheduleConfig: {
      frequency: 'monthly',
      time: '04:00',
      timezone: 'UTC',
      daysOfMonth: [1]
    }
  },
  {
    id: 'file-4',
    name: 'Wellness Program Extract',
    layoutId: getLayoutIdByType('wellness'),
    format: 'CSV',
    status: 'draft', // Must be draft because wellness layout is in draft
    createdAt: getPastDate(5),
    updatedAt: getPastDate(1),
    sftpConfig: {
      host: 'sftp.wellness.com',
      port: 22,
      username: 'wellness_user',
      path: '/exports'
    },
    scheduleConfig: {
      frequency: 'weekly',
      time: '02:00',
      timezone: 'America/Chicago',
      daysOfWeek: [2, 4] // Tuesday and Thursday
    }
  },
  {
    id: 'file-5',
    name: 'Wellness Reports',
    layoutId: getLayoutIdByType('wellness'),
    format: 'CSV',
    status: 'draft', // Must be draft because wellness layout is in draft
    createdAt: getPastDate(3),
    updatedAt: getPastDate(1),
    scheduleConfig: {
      frequency: 'daily',
      time: '03:00',
      timezone: 'UTC'
    }
  }
];

export const timezoneOptions = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'UTC', label: 'UTC' }
];

export const weekDayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getDayOfMonthSuffix(i + 1)}`
}));

function getDayOfMonthSuffix(day: number) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}