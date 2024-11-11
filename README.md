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
- Support for multiple file formats (CSV, TSV, Fixed Length)
- SFTP delivery configuration
- PGP encryption options
- Flexible scheduling options

![Screenshot: File Configuration](./public/images/file-manager.png)

### Scheduling and Automation
- Configure recurring schedules (Daily, Weekly, Monthly)
- Time window management
- Account-based scheduling
- Dependency management
- Automated file generation and delivery

![Screenshot: Schedule Configuration](./public/images/monitoring.png)

### Monitoring Dashboard
- Real-time processing status
- 15-day forecast view
- Comprehensive error tracking
- Historical performance metrics
- Email notifications for success/failure

[Screenshot: Monitoring Dashboard]

## Business Context

AxTract addresses common challenges in healthcare data management:

1. **Vendor Data Requirements**: Healthcare organizations need to share data with multiple vendors, each requiring specific formats and delivery methods.

2. **Compliance and Security**: Ensures secure data transmission with features like PGP encryption and SFTP delivery.

3. **Operation Efficiency**: Reduces manual effort in data extraction and delivery through automation and scheduling.

4. **Error Management**: Comprehensive monitoring and retry mechanisms ensure reliable data delivery.

## Technical Architecture

- **Frontend**: React + TypeScript with shadcn/ui components
- **Backend Services**:
  - Database: KsEdw (source system)
  - Scheduler: Jenkins
  - Message Queue: Kafka
  - Storage: AWS S3
  - Secure Vault: Credential storage

[Diagram: System Architecture]

## User Workflows

### Layout Management
1. Create/modify layout
2. Configure fields and validation
3. Export specifications
4. Get vendor approval
5. Activate layout

### File Configuration
1. Select approved layout
2. Configure format and delivery
3. Set up encryption
4. Configure notifications
5. Schedule generation

### Monitoring
1. Track file processing
2. Handle failures
3. View historical performance
4. Manage notifications

## Security Features

- Role-based access control
- Secure credential storage
- PGP encryption support
- SFTP with key authentication
- Audit trail logging

## Performance

- Supports files up to 50GB compressed
- Batch processing capabilities
- Configurable retry mechanisms
- Optimized for off-hours processing

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

## Contributing

[Contribution guidelines coming soon]

## License

[License information coming soon]

## Support

[Support information coming soon]

---

For more information, contact [contact information coming soon]