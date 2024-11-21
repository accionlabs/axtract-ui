// src/features/sources/types/index.ts
import { QueryDefinition } from "./query";

export type DataSourceType = "database" | "file" | "api";
export type DatabaseType = "postgresql" | "mysql" | "sqlserver";
export type FileType = "csv" | "json" | "xml";
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH";
export type DataSourceStatus = "active" | "inactive" | "error" | "configuring";
export type AuthType = "basic" | "bearer" | "oauth2";

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  schema: string;
  username: string;
  password: string;
}

export interface FileConfig {
  type: FileType;
  location: string;
  delimiter?: string;
  encoding?: string;
  hasHeader?: boolean;
}

export interface ApiConfig {
  url: string;
  method: ApiMethod;
  headers?: Record<string, string>;
  timeout?: number;
  authentication?: {
    type: AuthType;
    credentials: Record<string, string>;
  };
}

export interface FieldMetadata {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

// Table metadata structure
export interface TableMetadata {
  name: string;
  schema: string;
  fields: FieldMetadata[];
}

// Source metadata structure
export interface SourceMetadata {
  tables: TableMetadata[];
  lastSync?: string;
  totalRecords?: number;
}

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: DataSourceType;
  status: DataSourceStatus;
  createdAt: string;
  updatedAt: string;
  lastTestAt?: string;
  connectionDetails: DatabaseConfig | FileConfig | ApiConfig;
  metadata?: SourceMetadata;
  queries?: QueryDefinition[]; // Now properly typed
}

export interface SourceManagerState {
  dataSources: DataSource[];
  selectedSource?: string;
  isLoading: boolean;
  error?: string;
}

// Configuration constants
export const SOURCE_CONFIG = {
  database: {
    defaultPorts: {
      postgresql: 5432,
      mysql: 3306,
      sqlserver: 1433
    } satisfies Record<DatabaseType, number>,
    defaultSchemas: {
      postgresql: 'public',
      mysql: 'default',
      sqlserver: 'dbo'
    } satisfies Record<DatabaseType, string>
  },
  file: {
    supportedEncodings: ["UTF-8", "UTF-16", "ASCII", "ISO-8859-1"],
    defaultDelimiters: {
      csv: ",",
      tsv: "\t",
    },
    maxFileSize: 1024 * 1024 * 50, // 50MB
  },
  api: {
    timeoutSeconds: 30,
    maxRetries: 3,
    supportedContentTypes: ["application/json", "application/xml", "text/csv"],
  },
} as const;

export * from "./query"