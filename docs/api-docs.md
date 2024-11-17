# AxTract API Documentation

## Overview

The AxTract API provides programmatic access to all features of the AxTract data extraction platform. This RESTful API supports JSON for request/response payloads and uses standard HTTP methods and response codes.

## Base URL
```
Production: https://api.axtract.com/v1
Staging: https://api.staging.axtract.com/v1
```

## Authentication

All API requests require authentication using either a JWT token or API key.

### JWT Authentication
```http
Authorization: Bearer <token>
```

### API Key Authentication
```http
X-API-Key: <api-key>
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique-request-id>
```

## Rate Limiting

- 1000 requests per minute per API key
- 100 concurrent requests per API key
- Headers included in response:
  ```http
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 999
  X-RateLimit-Reset: 1640995200
  ```

## API Endpoints

### Layout Management

#### Create Layout
```http
POST /layouts
```

Request Body:
```json
{
  "name": "Claims Extract Layout",
  "type": "claims",
  "description": "Standard claims extract format",
  "fields": [
    {
      "name": "claim_id",
      "type": "string",
      "required": true,
      "validation": {
        "pattern": "^CLM[0-9]{10}$"
      }
    }
  ]
}
```

Response:
```json
{
  "id": "layout-123",
  "name": "Claims Extract Layout",
  "type": "claims",
  "status": "draft",
  "version": 1,
  "fields": [...],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### List Layouts
```http
GET /layouts
```

Query Parameters:
- `type` - Filter by layout type
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

Response:
```json
{
  "items": [
    {
      "id": "layout-123",
      "name": "Claims Extract Layout",
      "type": "claims",
      "status": "active",
      "version": 1,
      "fieldCount": 15,
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

#### Get Layout Details
```http
GET /layouts/{id}
```

Response:
```json
{
  "id": "layout-123",
  "name": "Claims Extract Layout",
  "type": "claims",
  "status": "active",
  "version": 1,
  "fields": [...],
  "metadata": {
    "lastUsed": "2024-01-01T00:00:00Z",
    "activeFiles": 5
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### File Configuration

#### Create File Configuration
```http
POST /files
```

Request Body:
```json
{
  "name": "Monthly Claims Extract",
  "layoutId": "layout-123",
  "format": "CSV",
  "deliveryConfig": {
    "type": "sftp",
    "sftp": {
      "host": "sftp.example.com",
      "port": 22,
      "username": "transfer_user",
      "path": "/uploads/claims"
    }
  },
  "scheduleConfig": {
    "frequency": "monthly",
    "time": "02:00",
    "timezone": "UTC",
    "daysOfMonth": [1]
  }
}
```

Response:
```json
{
  "id": "file-123",
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  ...
}
```

#### Create API Delivery Configuration
```http
POST /files
```

Request Body:
```json
{
  "name": "Real-time Claims Feed",
  "layoutId": "layout-123",
  "format": "JSON",
  "deliveryConfig": {
    "type": "api",
    "api": {
      "method": "POST",
      "url": "https://api.example.com/claims",
      "headers": {
        "Authorization": "Bearer ${env:API_TOKEN}",
        "Content-Type": "application/json"
      },
      "validateSsl": true,
      "timeout": 120,
      "retryStrategy": {
        "maxRetries": 3,
        "backoffMultiplier": 2
      }
    }
  }
}
```

#### Create Database Delivery Configuration
```http
POST /files
```

Request Body:
```json
{
  "name": "Claims Database Load",
  "layoutId": "layout-123",
  "format": "CSV",
  "deliveryConfig": {
    "type": "database",
    "database": {
      "type": "postgresql",
      "host": "db.example.com",
      "port": 5432,
      "name": "claims_db",
      "username": "${env:DB_USER}",
      "schema": "public",
      "table": "claims_data",
      "writeMode": "upsert",
      "batchSize": 1000,
      "connectionTimeout": 30
    }
  }
}
```

### Scheduling

#### Create Schedule
```http
POST /schedules
```

Request Body:
```json
{
  "fileId": "file-123",
  "frequency": "weekly",
  "time": "23:00",
  "timezone": "America/New_York",
  "daysOfWeek": [1, 3, 5],
  "effectiveDate": "2024-01-01",
  "expirationDate": null
}
```

Response:
```json
{
  "id": "schedule-123",
  "status": "active",
  "nextRun": "2024-01-01T23:00:00Z",
  ...
}
```

### Process Monitoring

#### List Processes
```http
GET /processes
```

Query Parameters:
- `status` - Filter by status
- `source` - Filter by source
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `page` - Page number
- `limit` - Items per page

Response:
```json
{
  "items": [
    {
      "processId": "proc-123",
      "fileId": "file-123",
      "fileName": "Monthly Claims Extract",
      "status": "processing",
      "progress": 45.5,
      "startTime": "2024-01-01T00:00:00Z",
      "recordsProcessed": 50000,
      "totalRecords": 100000
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Delivery Status

#### Check SFTP Delivery Status
```http
GET /delivery/sftp/status/{deliveryId}
```

Response:
```json
{
  "deliveryId": "del-123",
  "status": "completed",
  "fileSize": 1024000,
  "transferStart": "2024-01-01T00:00:00Z",
  "transferEnd": "2024-01-01T00:01:00Z",
  "remotePath": "/uploads/claims/file.csv"
}
```

#### Check API Delivery Status
```http
GET /delivery/api/status/{deliveryId}
```

Response:
```json
{
  "deliveryId": "del-123",
  "status": "completed",
  "requestTime": "2024-01-01T00:00:00Z",
  "responseTime": "2024-01-01T00:00:01Z",
  "responseCode": 200,
  "retryCount": 0
}
```

#### Check Database Delivery Status
```http
GET /delivery/db/status/{deliveryId}
```

Response:
```json
{
  "deliveryId": "del-123",
  "status": "completed",
  "rowsProcessed": 100000,
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T00:05:00Z",
  "batchesCompleted": 100,
  "totalBatches": 100
}
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('wss://api.axtract.com/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'JWT_TOKEN'
  }));
};
```

### Subscribe to Process Updates
```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'process',
  id: 'proc-123'
}));
```

### Message Format
```json
{
  "type": "update",
  "channel": "process",
  "id": "proc-123",
  "data": {
    "status": "processing",
    "progress": 45.5,
    "recordsProcessed": 50000,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid configuration",
    "details": {
      "field": "deliveryConfig.sftp.host",
      "reason": "Host name is required"
    },
    "requestId": "req-123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource does not exist
- `CONFLICT` - Resource conflict
- `DELIVERY_ERROR` - Delivery failure
- `PROCESSING_ERROR` - Processing failure
- `CONFIGURATION_ERROR` - Invalid configuration
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Testing

### Test Endpoints
```http
POST /delivery/sftp/test
POST /delivery/api/test
POST /delivery/db/test
```

### Example Test Response
```json
{
  "success": true,
  "details": {
    "connectionTime": 0.5,
    "writeSpeed": 10000,
    "validationResults": {
      "connectivity": "pass",
      "authentication": "pass",
      "permissions": "pass"
    }
  }
}
```

## SDK Examples

### Node.js
```javascript
const AxTract = require('axtract-node');
const client = new AxTract({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create a file configuration
const file = await client.files.create({
  name: 'Monthly Claims Extract',
  layoutId: 'layout-123',
  format: 'CSV',
  deliveryConfig: {
    type: 'sftp',
    sftp: {
      host: 'sftp.example.com',
      port: 22,
      username: 'transfer_user',
      path: '/uploads/claims'
    }
  }
});
```

### Python
```python
from axtract import AxTractClient

client = AxTractClient(
    api_key='your-api-key',
    environment='production'
)

# Create a database delivery configuration
file = client.files.create({
    'name': 'Claims Database Load',
    'layoutId': 'layout-123',
    'format': 'CSV',
    'deliveryConfig': {
        'type': 'database',
        'database': {
            'type': 'postgresql',
            'host': 'db.example.com',
            'port': 5432,
            'name': 'claims_db',
            'schema': 'public',
            'table': 'claims_data',
            'writeMode': 'upsert'
        }
    }
})
```

## API Versioning

The API is versioned through the URL path. The current version is `v1`. When breaking changes are introduced, a new version will be released, and the previous version will be supported for 12 months after deprecation notice.

For additional details or specific implementation guides, please refer to the following documentation:
- [Technical Documentation](./docs/technical-docs.md)
- [API Documentation](./docs/api-docs.md)
- [Development Guide](./docs/development-guide.md)
- [Security Policies](./docs/security-policies.md)
- [Operations Manual](./docs/operations-manual.md)
