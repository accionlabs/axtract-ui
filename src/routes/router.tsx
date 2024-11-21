import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './constants';
import MainLayout from '@/components/shared/MainLayout';
import Dashboard from '@/features/dashboard/Dashboard';
import LayoutManager from '@/features/layouts/LayoutManager';
import FileManager from '@/features/files/FileManager';
import { Monitoring } from '@/features/monitoring/Monitoring';
import SourceManager from '@/features/sources/SourceManager';

// Get the base URL from Vite's env
const baseUrl = import.meta.env.BASE_URL;

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          path: '',
          element: <Dashboard />,
        },
        {
          path: ROUTES.SOURCE_MANAGER.replace('/', ''),
          element: <SourceManager />,
        },
        {
          path: ROUTES.LAYOUT_MANAGER.replace('/', ''),
          element: <LayoutManager />,
        },
        {
          path: ROUTES.FILE_MANAGER.replace('/', ''),
          element: <FileManager />,
        },
        {
          path: ROUTES.MONITORING.replace('/', ''),
          element: <Monitoring />,
        },
      ],
    },
  ],
  {
    // Use the base URL from Vite
    basename: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
  }
);