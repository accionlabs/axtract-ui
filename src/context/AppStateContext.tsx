// src/context/AppStateContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Layout } from '@/features/layouts/types';
import { FileConfiguration } from '@/features/files/types';
import { FileProcessingDetails } from '@/features/monitoring/types';
import { mockLayouts } from '@/features/layouts/mockData';
import { mockFiles } from '@/features/files/mockData';
import { mockMonitoringData } from '@/features/monitoring/mockData';
import { Activity, ActivityStatus } from '@/features/dashboard/types';

// Define the state structure
interface AppState {
  layouts: Layout[];
  files: FileConfiguration[];
  processes: FileProcessingDetails[];
}

// Define action types
type AppAction =
  | { type: 'ADD_LAYOUT'; payload: Layout }
  | { type: 'UPDATE_LAYOUT'; payload: Layout }
  | { type: 'DELETE_LAYOUT'; payload: string }
  | { type: 'ADD_FILE'; payload: FileConfiguration }
  | { type: 'UPDATE_FILE'; payload: FileConfiguration }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'ADD_PROCESS'; payload: FileProcessingDetails }
  | { type: 'UPDATE_PROCESS'; payload: FileProcessingDetails }
  | { type: 'DELETE_PROCESS'; payload: string };

interface AppStateContextType {
  state: AppState;
  addLayout: (layout: Layout) => void;
  updateLayout: (layout: Layout) => void;
  deleteLayout: (id: string) => void;
  addFile: (file: FileConfiguration) => void;
  updateFile: (file: FileConfiguration) => void;
  deleteFile: (id: string) => void;
  addProcess: (process: FileProcessingDetails) => void;
  updateProcess: (process: FileProcessingDetails) => void;
  deleteProcess: (id: string) => void;
}

// Create the context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Create reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_LAYOUT':
      return {
        ...state,
        layouts: [...state.layouts, action.payload],
      };
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layouts: state.layouts.map((layout) =>
          layout.id === action.payload.id ? action.payload : layout
        ),
      };
    case 'DELETE_LAYOUT':
      return {
        ...state,
        layouts: state.layouts.filter((layout) => layout.id !== action.payload),
      };
    case 'ADD_FILE':
      return {
        ...state,
        files: [...state.files, action.payload],
      };
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.payload.id ? action.payload : file
        ),
      };
    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.payload),
      };
    case 'ADD_PROCESS':
      return {
        ...state,
        processes: [...state.processes, action.payload],
      };
    case 'UPDATE_PROCESS':
      return {
        ...state,
        processes: state.processes.map((process) =>
          process.processId === action.payload.processId ? action.payload : process
        ),
      };
    case 'DELETE_PROCESS':
      return {
        ...state,
        processes: state.processes.filter((process) => process.processId !== action.payload),
      };
    default:
      return state;
  }
}

// Create provider component
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    layouts: mockLayouts,
    files: mockFiles,
    processes: mockMonitoringData,
  });

  const addLayout = useCallback((layout: Layout) => {
    dispatch({ type: 'ADD_LAYOUT', payload: layout });
  }, []);

  const updateLayout = useCallback((layout: Layout) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: layout });
  }, []);

  const deleteLayout = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LAYOUT', payload: id });
  }, []);

  const addFile = useCallback((file: FileConfiguration) => {
    dispatch({ type: 'ADD_FILE', payload: file });
  }, []);

  const updateFile = useCallback((file: FileConfiguration) => {
    dispatch({ type: 'UPDATE_FILE', payload: file });
  }, []);

  const deleteFile = useCallback((id: string) => {
    dispatch({ type: 'DELETE_FILE', payload: id });
  }, []);

  const addProcess = useCallback((process: FileProcessingDetails) => {
    dispatch({ type: 'ADD_PROCESS', payload: process });
  }, []);

  const updateProcess = useCallback((process: FileProcessingDetails) => {
    dispatch({ type: 'UPDATE_PROCESS', payload: process });
  }, []);

  const deleteProcess = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROCESS', payload: id });
  }, []);

  const value = {
    state,
    addLayout,
    updateLayout,
    deleteLayout,
    addFile,
    updateFile,
    deleteFile,
    addProcess,
    updateProcess,
    deleteProcess,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// Create hook for using the context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

// Dashboard stats types
interface DashboardStats {
  layouts: {
    total: number;
    active: number;
    pending: number;
    draft: number;
  };
  files: {
    total: number;
    active: number;
    scheduled: number;
    runningToday: number;
  };
  monitoring: {
    successRate: string;
    activeProcesses: number;
    pendingProcesses: number;
    failedProcesses: number;
  };
  recentActivity: Activity[];
}

// Helper functions for activity status
const getLayoutStatus = (status: string): ActivityStatus => {
  switch (status) {
    case 'active':
      return 'Success';
    case 'pending':
      return 'Info';
    default:
      return 'Failed';
  }
};

const getFileStatus = (status: string): ActivityStatus => {
  switch (status) {
    case 'active':
      return 'Success';
    case 'draft':
      return 'Info';
    default:
      return 'Failed';
  }
};

const getProcessStatus = (status: string): ActivityStatus => {
  switch (status) {
    case 'completed':
      return 'Success';
    case 'processing':
      return 'Info';
    default:
      return 'Failed';
  }
};

// Dashboard stats hook
export function useDashboardStats(): DashboardStats {
  const { state } = useAppState();

  const layoutStats = {
    total: state.layouts.length,
    active: state.layouts.filter(l => l.status === 'active').length,
    pending: state.layouts.filter(l => l.status === 'pending').length,
    draft: state.layouts.filter(l => l.status === 'draft').length
  };

  const fileStats = {
    total: state.files.length,
    active: state.files.filter(f => f.status === 'active').length,
    scheduled: state.files.filter(f => f.scheduleConfig).length,
    runningToday: state.files.filter(f => {
      if (!f.scheduleConfig || f.status !== 'active') return false;
      
      const now = new Date();
      const today = now.getDay();
      
      switch (f.scheduleConfig.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          return f.scheduleConfig.daysOfWeek?.includes(today);
        case 'monthly':
          return f.scheduleConfig.daysOfMonth?.includes(now.getDate());
        default:
          return false;
      }
    }).length
  };

  const monitoringStats = {
    successRate: (state.processes.filter(m => m.status === 'completed').length / 
      Math.max(state.processes.length, 1) * 100).toFixed(1),
    activeProcesses: state.processes.filter(m => m.status === 'processing').length,
    pendingProcesses: state.processes.filter(m => m.status === 'pending').length,
    failedProcesses: state.processes.filter(m => m.status === 'failed').length
  };

  const recentActivity: Activity[] = [
    ...state.layouts.map(layout => ({
      id: `layout-${layout.id}`,
      type: 'Layout Update',
      details: `${layout.name} - ${layout.status}`,
      status: getLayoutStatus(layout.status),
      timestamp: layout.lastModified
    })),
    ...state.files.map(file => ({
      id: `file-${file.id}`,
      type: 'File Configuration',
      details: `${file.name} - ${file.status}`,
      status: getFileStatus(file.status),
      timestamp: file.updatedAt
    })),
    ...state.processes.map(process => ({
      id: `process-${process.processId}`,
      type: 'File Processing',
      details: `${process.fileName} - ${process.status}`,
      status: getProcessStatus(process.status),
      timestamp: process.createdAt
    }))
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    layouts: layoutStats,
    files: fileStats,
    monitoring: monitoringStats,
    recentActivity
  };
}