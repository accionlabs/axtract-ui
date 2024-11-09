export const ROUTES = {
    DASHBOARD: '/',
    LAYOUT_MANAGER: '/layouts',
    FILE_MANAGER: '/files',
    SCHEDULE_MANAGER: '/schedules',
  } as const;
  
  // Helper function to get full path with base URL
  export const getFullPath = (path: string) => {
    const baseUrl = import.meta.env.BASE_URL;
    return `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
  };