// src/routes/constants.ts
export const ROUTES = {
    DASHBOARD: '/',
    LAYOUT_MANAGER: '/layouts',
    FILE_MANAGER: '/files',
    SCHEDULE_MANAGER: '/schedules',
  } as const;
  
  export type AppRoutes = typeof ROUTES;