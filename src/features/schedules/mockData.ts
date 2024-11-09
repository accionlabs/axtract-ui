// src/features/schedules/mockData.ts
import { ScheduleConfiguration } from './types';

// Helper to generate future date
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Helper to generate past date
const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const mockSchedules: ScheduleConfiguration[] = [
  {
    id: 'schedule-1',
    name: 'Daily Claims Extract',
    description: 'Daily extraction of claims data for vendor processing',
    fileId: 'file-1',
    frequency: 'daily',
    status: 'active',
    time: '23:00',
    timezone: 'America/Los_Angeles',
    lastRun: getPastDate(1),
    nextRun: getFutureDate(1),
    createdAt: getPastDate(30),
    updatedAt: getPastDate(5),
    retryConfig: {
      maxAttempts: 3,
      delayMinutes: 15
    },
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationEmails: ['ops@company.com', 'claims@company.com']
  },
  {
    id: 'schedule-2',
    name: 'Weekly Provider Summary',
    description: 'Weekly summary of provider activity and payments',
    fileId: 'file-2',
    frequency: 'weekly',
    status: 'active',
    time: '01:00',
    timezone: 'America/New_York',
    weekDays: ['monday'],
    lastRun: getPastDate(7),
    nextRun: getFutureDate(3),
    createdAt: getPastDate(90),
    updatedAt: getPastDate(7),
    retryConfig: {
      maxAttempts: 2,
      delayMinutes: 30
    },
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notificationEmails: ['providers@company.com']
  },
  {
    id: 'schedule-3',
    name: 'Monthly Financial Report',
    description: 'Monthly financial reconciliation report',
    fileId: 'file-3',
    frequency: 'monthly',
    status: 'active',
    time: '04:00',
    timezone: 'UTC',
    monthDays: [1],
    lastRun: getPastDate(15),
    nextRun: getFutureDate(15),
    createdAt: getPastDate(180),
    updatedAt: getPastDate(15),
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationEmails: ['finance@company.com']
  },
  {
    id: 'schedule-4',
    name: 'Weekly Compliance Export',
    description: 'Weekly export of compliance data',
    fileId: 'file-4',
    frequency: 'weekly',
    status: 'suspended',
    time: '22:00',
    timezone: 'America/Chicago',
    weekDays: ['sunday'],
    lastRun: getPastDate(10),
    nextRun: '',
    createdAt: getPastDate(45),
    updatedAt: getPastDate(2),
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationEmails: ['compliance@company.com']
  },
  {
    id: 'schedule-5',
    name: 'Daily Member Updates',
    description: 'Daily member eligibility and demographic updates',
    fileId: 'file-5',
    frequency: 'daily',
    status: 'pending',
    time: '20:00',
    timezone: 'America/Los_Angeles',
    createdAt: getPastDate(1),
    updatedAt: getPastDate(1),
    retryConfig: {
      maxAttempts: 3,
      delayMinutes: 10
    },
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notificationEmails: ['membership@company.com']
  },
  {
    id: 'schedule-6',
    name: 'Bi-weekly Payroll Export',
    description: 'Bi-weekly export of payroll data',
    fileId: 'file-6',
    frequency: 'weekly',
    status: 'active',
    time: '18:00',
    timezone: 'America/New_York',
    weekDays: ['friday'],
    lastRun: getPastDate(7),
    nextRun: getFutureDate(7),
    createdAt: getPastDate(120),
    updatedAt: getPastDate(7),
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationEmails: ['payroll@company.com', 'hr@company.com']
  },
  {
    id: 'schedule-7',
    name: 'Monthly Audit Log',
    description: 'Monthly export of system audit logs',
    fileId: 'file-7',
    frequency: 'monthly',
    status: 'active',
    time: '02:00',
    timezone: 'UTC',
    monthDays: [1],
    lastRun: getPastDate(30),
    nextRun: getFutureDate(1),
    createdAt: getPastDate(365),
    updatedAt: getPastDate(30),
    retryConfig: {
      maxAttempts: 5,
      delayMinutes: 20
    },
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationEmails: ['security@company.com', 'compliance@company.com']
  }
];

export const mockFiles = [
  { id: 'file-1', name: 'Claims Data Extract' },
  { id: 'file-2', name: 'Provider Summary Report' },
  { id: 'file-3', name: 'Financial Reconciliation' },
  { id: 'file-4', name: 'Compliance Report' },
  { id: 'file-5', name: 'Member Updates File' },
  { id: 'file-6', name: 'Payroll Data Export' },
  { id: 'file-7', name: 'System Audit Logs' }
];

// Common timezones for select dropdown
export const commonTimezones = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'UTC', label: 'UTC' }
];

// Week days for select dropdown
export const weekDayOptions = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
];

// Month days for select dropdown (1-31)
export const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getDayOfMonthSuffix(i + 1)}`
}));

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