// src/features/source-manager/schemas/form-schemas.ts

import * as z from 'zod';

// Database Configuration Schema
export const databaseConfigSchema = z.object({
  type: z.enum(['postgresql', 'mysql', 'sqlserver'] as const),
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1).max(65535),
  database: z.string().min(1, 'Database name is required'),
  schema: z.string(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// File Configuration Schema
export const fileConfigSchema = z.object({
  type: z.enum(['csv', 'json', 'xml'] as const),
  location: z.string().min(1, 'File location is required'),
  delimiter: z.string().optional(),
  encoding: z.string().optional(),
  hasHeader: z.boolean().optional()
});

// Authentication Schema
const authenticationSchema = z.object({
  type: z.enum(['basic', 'bearer', 'oauth2']),
  credentials: z.record(z.string())
});

// API Configuration Schema
export const apiConfigSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH']),
  headers: z.record(z.string()).optional(),
  timeout: z.number().min(1).max(300).optional(),
  validateSsl: z.boolean().optional(),
  authentication: authenticationSchema.optional()
});

// Base Form Schema
export const baseFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['database', 'file', 'api'] as const),
});

// Combined Form Schema
export const formSchema = baseFormSchema.and(
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('database'), database: databaseConfigSchema }),
    z.object({ type: z.literal('file'), file: fileConfigSchema }),
    z.object({ type: z.literal('api'), api: apiConfigSchema })
  ])
);

export type FormValues = z.infer<typeof formSchema>;