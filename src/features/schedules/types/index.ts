// src/features/schedules/types/index.ts
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';
export type ScheduleStatus = 'active' | 'pending' | 'suspended';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScheduleConfiguration {
  id: string;
  name: string;
  description: string;
  fileId: string;
  frequency: ScheduleFrequency;
  status: ScheduleStatus;
  time: string;
  timezone: string;
  weekDays?: WeekDay[];
  monthDays?: number[];
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
  retryConfig?: {
    maxAttempts: number;
    delayMinutes: number;
  };
  notifyOnSuccess?: boolean;
  notifyOnFailure?: boolean;
  notificationEmails?: string[];
}

export interface ScheduleFormValues {
  name: string;
  description: string;
  fileId: string;
  frequency: ScheduleFrequency;
  time: string;
  timezone: string;
  weekDays?: WeekDay[];
  monthDays?: number[];
  retryConfig?: {
    maxAttempts: number;
    delayMinutes: number;
  };
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationEmails: string[];
}