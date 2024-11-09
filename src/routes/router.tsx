// src/routes/router.tsx
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import MainLayout from '@/components/shared/MainLayout';
import { Dashboard } from '@/features/dashboard';
import { ROUTES } from './constants';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.LAYOUT_MANAGER,
        async lazy() {
          const { LayoutManager } = await import('@/features/layouts');
          return { Component: LayoutManager };
        },
      },
      {
        path: ROUTES.FILE_MANAGER,
        async lazy() {
          const { FileManager } = await import('@/features/files');
          return { Component: FileManager };
        },
      },
      {
        path: ROUTES.SCHEDULE_MANAGER,
        async lazy() {
          const { ScheduleManager } = await import('@/features/schedules');
          return { Component: ScheduleManager };
        },
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;