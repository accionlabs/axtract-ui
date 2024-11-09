import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './constants';
import MainLayout from '@/components/shared/MainLayout';
import Dashboard from '@/features/dashboard/Dashboard';
import LayoutManager from '@/features/layouts/LayoutManager';
import FileManager from '@/features/files/FileManager';
import ScheduleManager from '@/features/schedules/ScheduleManager';

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
          path: ROUTES.LAYOUT_MANAGER.replace('/', ''),
          element: <LayoutManager />,
        },
        {
          path: ROUTES.FILE_MANAGER.replace('/', ''),
          element: <FileManager />,
        },
        {
          path: ROUTES.SCHEDULE_MANAGER.replace('/', ''),
          element: <ScheduleManager />,
        },
      ],
    },
  ],
  {
    // Use the base URL from Vite
    basename: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
  }
);