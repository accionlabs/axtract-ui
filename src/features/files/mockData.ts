// src/features/fileManager/mockData.ts
import { FileConfiguration } from './types';

export const mockFiles: FileConfiguration[] = [
  {
    id: '1',
    name: 'Monthly Claims Extract',
    layoutId: 'layout-1',
    format: 'CSV',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sftpConfig: {
      host: 'sftp.vendor1.com',
      port: 22,
      username: 'vendor1',
      path: '/uploads/claims'
    },
    scheduleConfig: {
      frequency: 'monthly',
      time: '02:00',
      daysOfMonth: [1],
      timezone: 'America/Los_Angeles'
    },
    encryptionConfig: {
      enabled: true,
      type: 'PGP'
    }
  },
  {
    id: '2',
    name: 'Weekly Eligibility Data',
    layoutId: 'layout-2',
    format: 'TSV',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    sftpConfig: {
      host: 'sftp.vendor2.com',
      port: 22,
      username: 'vendor2',
      path: '/incoming'
    },
    scheduleConfig: {
      frequency: 'weekly',
      time: '01:00',
      daysOfWeek: [1], // Monday
      timezone: 'America/New_York'
    }
  },
  {
    id: '3',
    name: 'Daily Provider Update',
    layoutId: 'layout-3',
    format: 'FIXED',
    status: 'draft',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

// Mock available layouts for selection
export const mockLayouts = [
  { id: 'layout-1', name: 'Claims Layout v1' },
  { id: 'layout-2', name: 'Eligibility Layout v2' },
  { id: 'layout-3', name: 'Provider Layout v1' },
];