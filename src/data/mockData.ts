// src/data/mockData.ts
import { Layout, File, Schedule, Activity } from '../types';

export const layouts: Layout[] = [
  {
    id: 1,
    name: "Claims Extract Layout",
    version: "1.0",
    status: "Active",
    fields: [
      { name: "ClaimID", type: "string", required: true },
      { name: "MemberID", type: "string", required: true },
      { name: "ServiceDate", type: "date", required: true },
      { name: "Amount", type: "decimal", required: true },
      { name: "ProviderID", type: "string", required: true }
    ],
    staticFields: [
      { name: "FileType", value: "CLM", length: 3 },
      { name: "Version", value: "001", length: 3 }
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Eligibility Layout",
    version: "2.1",
    status: "Draft",
    fields: [
      { name: "MemberID", type: "string", required: true },
      { name: "FirstName", type: "string", required: true },
      { name: "LastName", type: "string", required: true },
      { name: "EffectiveDate", type: "date", required: true },
      { name: "TermDate", type: "date", required: false }
    ],
    staticFields: [
      { name: "FileType", value: "ELG", length: 3 },
      { name: "Version", value: "002", length: 3 }
    ],
    createdAt: "2024-02-01",
    updatedAt: "2024-02-10"
  }
];

export const files: File[] = [
  {
    id: 1,
    name: "Daily_Claims_Extract",
    layoutId: 1,
    format: "CSV",
    delimiter: ",",
    schedule: "Daily",
    status: "Active",
    sftp: {
      host: "sftp.vendor1.com",
      path: "/incoming/claims",
      username: "vendor1"
    },
    encryption: {
      enabled: true,
      type: "PGP"
    },
    notifications: [
      { email: "vendor1@example.com", events: ["success", "failure"] }
    ]
  },
  {
    id: 2,
    name: "Monthly_Eligibility",
    layoutId: 2,
    format: "Fixed",
    schedule: "Monthly",
    status: "Active",
    sftp: {
      host: "sftp.vendor2.com",
      path: "/incoming/elig",
      username: "vendor2"
    },
    encryption: {
      enabled: false
    },
    notifications: [
      { email: "vendor2@example.com", events: ["failure"] }
    ]
  }
];

export const schedules: Schedule[] = [
  {
    id: 1,
    fileId: 1,
    type: "Daily",
    startTime: "01:00",
    maxDuration: "02:00",
    nextRun: "2024-11-09 01:00",
    status: "Active",
    lastRun: {
      status: "Success",
      startTime: "2024-11-08 01:00",
      endTime: "2024-11-08 02:30"
    }
  },
  {
    id: 2,
    fileId: 2,
    type: "Monthly",
    startTime: "23:00",
    maxDuration: "04:00",
    nextRun: "2024-12-01 23:00",
    status: "Active",
    lastRun: {
      status: "Failed",
      startTime: "2024-11-01 23:00",
      endTime: "2024-11-02 00:15",
      error: "SFTP connection failed"
    }
  }
];

export const recentActivity: Activity[] = [
  {
    id: 1,
    type: "File Generation",
    status: "Success",
    details: "Daily_Claims_Extract completed successfully",
    timestamp: "2024-11-08 02:30"
  },
  {
    id: 2,
    type: "Layout Update",
    status: "Info",
    details: "Eligibility Layout updated to version 2.1",
    timestamp: "2024-11-08 10:15"
  },
  {
    id: 3,
    type: "File Generation",
    status: "Failed",
    details: "Monthly_Eligibility failed - SFTP error",
    timestamp: "2024-11-02 00:15"
  }
];