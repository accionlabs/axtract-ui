// src/features/sources/configs/defaults.ts

import { DatabaseConfig, FileConfig, ApiConfig, SOURCE_CONFIG } from '../types';

export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  type: 'postgresql',
  host: '',
  port: SOURCE_CONFIG.database.defaultPorts.postgresql,
  database: '',
  schema: SOURCE_CONFIG.database.defaultSchemas.postgresql,
  username: '',
  password: ''
};

export const DEFAULT_FILE_CONFIG: FileConfig = {
  type: 'csv',
  location: '',
  delimiter: SOURCE_CONFIG.file.defaultDelimiters.csv,
  encoding: 'UTF-8',
  hasHeader: true
};

export const DEFAULT_API_CONFIG: ApiConfig = {
  url: '',
  method: 'GET',
  headers: {},
  timeout: SOURCE_CONFIG.api.timeoutSeconds,
  authentication: {
    type: 'bearer',
    credentials: {}
  }
};