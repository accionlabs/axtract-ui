// src/features/dashboard/types/index.ts

export type ActivityStatus = 'Success' | 'Failed' | 'Info';

export interface Activity {
  id: string;  // Changed from number to string
  type: string;
  details: string;
  status: ActivityStatus;
  timestamp: string;
}