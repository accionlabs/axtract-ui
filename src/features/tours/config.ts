// src/features/tours/config.ts

import { ROUTES } from '@/routes/constants';

// Define the available tour sections including dashboard
export type TourName = 'dashboard' | 'layout-manager' | 'file-manager' | 'monitoring';

// Define tour step with additional metadata
export interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    disableBeacon?: boolean;
    spotlightPadding?: number;
    nextRoute?: string; // New property to indicate where to navigate next
}

// Define tours
export const TOURS: Record<TourName, TourStep[]> = {
    'dashboard': [
        {
            target: '.dashboard-header',
            title: 'Welcome to AxTract',
            content: 'This is your dashboard where you can monitor all extract activities at a glance.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '.dashboard-stats',
            title: 'Overview Statistics',
            content: 'View key metrics about your layouts, files, and processing status.',
            placement: 'bottom',
        },
        {
            target: '.dashboard-processing',
            title: 'Processing Overview',
            content: 'Monitor active file processing and track completion rates.',
            placement: 'bottom',
        },
        {
            target: '.dashboard-activity',
            title: 'Recent Activity',
            content: 'Keep track of recent changes and system events.',
            placement: 'left',
            nextRoute: ROUTES.LAYOUT_MANAGER // Navigate to layouts after dashboard tour
        }
    ],
    'layout-manager': [
        {
            target: '.layout-manager-header',
            title: 'Layout Manager',
            content: 'Create and manage data extract layouts. Layouts define the structure and format of your data extracts.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '.create-layout-button',
            title: 'Create New Layout',
            content: 'Click here to create a new layout. You can define fields, validation rules, and organize your data structure.',
            placement: 'left',
        },
        {
            target: '.layout-stats',
            title: 'Layout Statistics',
            content: 'View key metrics about your layouts, including active layouts, pending reviews, and recent changes.',
            placement: 'bottom',
        },
        {
            target: '.layout-list',
            title: 'Layout List',
            content: 'View and manage all your layouts. You can edit, activate, or delete layouts from here.',
            placement: 'top',
            nextRoute: ROUTES.FILE_MANAGER // Navigate to layouts after dashboard tour
        }
    ],
    'file-manager': [
        {
            target: '.file-manager-header',
            title: 'File Manager',
            content: 'Configure and manage your data extract files. Files use layouts to define their structure and can be scheduled or triggered manually.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '.create-file-button',
            title: 'Create New File',
            content: 'Click here to create a new file configuration. You\'ll select a layout and configure delivery settings.',
            placement: 'left',
        },
        {
            target: '.file-stats',
            title: 'File Statistics',
            content: 'View key metrics about your files, including active files, scheduled extracts, and processing status.',
            placement: 'bottom',
        },
        {
            target: '.file-list',
            title: 'File List',
            content: 'View and manage all your file configurations. You can edit settings, schedule extracts, and monitor status.',
            placement: 'top',
            nextRoute: ROUTES.MONITORING // Navigate to layouts after dashboard tour
        }
    ],
    'monitoring': [
        {
            target: '.monitoring-header',
            title: 'Monitoring Dashboard',
            content: 'Monitor the status and progress of your data extracts in real-time.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '.monitoring-stats',
            title: 'Processing Statistics',
            content: 'View key metrics about your extract processing, including active processes, success rates, and processing times.',
            placement: 'bottom',
        },
        {
            target: '.monitoring-filters',
            title: 'Filters',
            content: 'Filter and search through your processing history by status, date range, or file name.',
            placement: 'bottom',
        },
        {
            target: '.monitoring-table',
            title: 'Processing History',
            content: 'View detailed information about each extract process, including status, progress, and any errors.',
            placement: 'top',
            nextRoute: ROUTES.DASHBOARD // Navigate to layouts after dashboard tour
        }
    ]
};