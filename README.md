# AxTract - Self-Service Extract Tool

AxTract is a modern, web-based self-service extract tool that enables business users to configure, manage, and monitor data extracts for vendors and partners from a healthcare data platform. Built with React and TypeScript, it offers a streamlined interface for managing complex data extraction processes.

![Screenshot: Dashboard Overview](./public/images/dashboard.png)

## Key Features

### Layout Manager
- Create and manage reusable data layouts
- Configure fields with validation rules and custom properties
- Support for multiple layout types (Claims, Eligibility, Wellness)
- Version control and draft management
- Field library with pre-configured templates

![Screenshot: Layout Manager Interface](./public/images/layout-manager.png)

### File Configuration Manager
- Configure file outputs based on layouts
- Support for multiple file formats (CSV, TSV, Fixed Length, JSON)
- Multiple delivery methods:
  - **SFTP Transfer**
    - Host and path configuration
    - Port customization
    - SSH key authentication
    - Known hosts verification
  - **API Endpoints**
    - Multiple HTTP methods (POST, PUT, PATCH)
    - Custom header configuration
    - SSL verification options
    - Configurable timeout and retry strategy
  - **Database Destinations**
    - Support for multiple database types (PostgreSQL, MySQL, SQL Server, Oracle)
    - Schema and table configuration 
    - Write mode options (Insert, Upsert, Replace)
    - Batch size and connection timeout configuration
- PGP encryption options
- Flexible scheduling options

![Screenshot: File Configuration](./public/images/file-manager.png)

### Scheduling and Automation
- Configure recurring schedules (Daily, Weekly, Monthly)
- Time window management
- Account-based scheduling
- Dependency management
- Automated file generation and delivery
- Timezone-aware scheduling
- Custom retry strategies per delivery method

![Screenshot: Schedule Configuration](./public/images/monitoring.png)

### Monitoring Dashboard
- Real-time processing status
- 15-day forecast view
- Comprehensive error tracking
- Historical performance metrics
- Email notifications for success/failure
- Delivery status tracking for all destination types

![Screenshot: Monitoring Dashboard](./public/images/monitoring.png)

## Business Context

AxTract addresses common challenges in healthcare data management:

1. **Vendor Data Requirements**: Healthcare organizations need to share data with multiple vendors, each requiring specific formats and delivery methods.

2. **Compliance and Security**: Ensures secure data transmission with features like:
   - PGP encryption
   - SFTP with SSH key authentication
   - SSL verification for API endpoints
   - Secure database connections
   - Credential vaulting

3. **Operation Efficiency**: Reduces manual effort through:
   - Automated delivery to multiple destination types
   - Intelligent retry strategies
   - Batch processing optimizations
   - Configurable write modes for database destinations

4. **Error Management**: 
   - Comprehensive monitoring across all delivery methods
   - Method-specific retry strategies
   - Detailed error logging and tracking
   - Automated failure notifications

## Technical Architecture

- **Frontend**: React + TypeScript with shadcn/ui components
- **Backend Services**:
  - Database: KsEdw (source system)
  - Scheduler: Jenkins
  - Message Queue: Kafka
  - Storage: AWS S3
  - Secure Vault: Credential storage
  - API Gateway: Request routing and authentication
  - Database Connection Pool: Managed database connections

## Delivery Configuration Examples

### SFTP Configuration
```json
{
  "type": "sftp",
  "sftp": {
    "host": "sftp.example.com",
    "port": 22,
    "username": "transfer_user",
    "path": "/uploads/data",
    "knownHostKey": "ssh-rsa AAAAB3NzaC1..."
  }
}
```

### API Configuration
```json
{
  "type": "api",
  "api": {
    "method": "POST",
    "url": "https://api.example.com/data",
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
```

### Database Configuration
```json
{
  "type": "database",
  "database": {
    "type": "postgresql",
    "host": "db.example.com",
    "port": 5432,
    "name": "analytics_db",
    "username": "etl_user",
    "schema": "public",
    "table": "processed_data",
    "writeMode": "upsert",
    "batchSize": 1000,
    "connectionTimeout": 30
  }
}
```

## User Workflows

### Layout Management
1. Create/modify layout
2. Configure fields and validation
3. Export specifications
4. Get vendor approval
5. Activate layout

### File Configuration
1. Select approved layout
2. Configure format and delivery method:
   - Set up SFTP transfer
   - Configure API endpoint
   - Set up database destination
3. Set up encryption (if required)
4. Configure notifications
5. Schedule generation

### Monitoring
1. Track file processing
2. Monitor delivery status
3. Handle failures
4. View historical performance
5. Manage notifications

## Security Features

- Role-based access control
- Secure credential storage
- PGP encryption support
- Multiple authentication methods:
  - SFTP key authentication
  - API tokens
  - Database credentials
- Audit trail logging

## Performance

- Supports files up to 50GB compressed
- Batch processing capabilities
- Configurable retry mechanisms
- Optimized for off-hours processing
- Database connection pooling
- Configurable timeouts per delivery method

## Getting Started

[Installation instructions coming soon]

## Development

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Setup
```bash
git clone [repository]
cd axtract
npm install
npm run dev
```

### Build
```bash
npm run build
```

For detailed API documentation and architecture diagrams, please refer to the [technical documentation](./docs/technical-docs.md).
