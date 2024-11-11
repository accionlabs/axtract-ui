// src/context/AppStateContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Layout, LayoutStatus } from '@/features/layouts/types';
import { FileConfiguration, FileStatus } from '@/features/files/types';
import { FileProcessingDetails, ProcessingStatus } from '@/features/monitoring/types';
import { Activity, ActivityStatus } from '@/features/dashboard/types';
import { mockLayouts } from '@/features/layouts/mockData';
import { mockFiles } from '@/features/files/mockData';
import { mockMonitoringData } from '@/features/monitoring/mockData';

// State interface
interface AppState {
  layouts: Layout[];
  files: FileConfiguration[];
  processes: FileProcessingDetails[];
  activities: Activity[];
}

// Enhanced Action Types
type ActionType = 
  // Layout Actions
  | { type: 'ADD_LAYOUT'; payload: Layout }
  | { type: 'UPDATE_LAYOUT'; payload: Layout }
  | { type: 'DELETE_LAYOUT'; payload: string }
  | { type: 'UPDATE_LAYOUT_STATUS'; payload: { id: string; status: LayoutStatus } }
  // File Actions
  | { type: 'ADD_FILE'; payload: FileConfiguration }
  | { type: 'UPDATE_FILE'; payload: FileConfiguration }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'UPDATE_FILE_STATUS'; payload: { id: string; status: FileStatus } }
  // Process Actions
  | { type: 'ADD_PROCESS'; payload: FileProcessingDetails }
  | { type: 'UPDATE_PROCESS'; payload: FileProcessingDetails }
  | { type: 'DELETE_PROCESS'; payload: string }
  | { type: 'UPDATE_PROCESS_STATUS'; payload: { id: string; status: ProcessingStatus } }
  // Activity Actions
  | { type: 'ADD_ACTIVITY'; payload: Activity };

// Activity generation utilities
const createActivity = (
  type: string,
  details: string,
  status: ActivityStatus = 'Info'
): Activity => ({
  id: `activity-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  type,
  details,
  status,
  timestamp: new Date().toISOString()
});

// State update utilities
const addActivityToState = (state: AppState, activity: Activity): AppState => ({
  ...state,
  activities: [activity, ...state.activities].slice(0, 50) // Keep last 50 activities
});

// Main reducer
function appReducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case 'ADD_LAYOUT': {
      const activity = createActivity(
        'Layout Created',
        `Layout "${action.payload.name}" created`,
        'Success'
      );
      return addActivityToState({
        ...state,
        layouts: [...state.layouts, action.payload]
      }, activity);
    }

    case 'UPDATE_LAYOUT': {
      const activity = createActivity(
        'Layout Updated',
        `Layout "${action.payload.name}" updated`,
        'Info'
      );
      return addActivityToState({
        ...state,
        layouts: state.layouts.map(layout =>
          layout.id === action.payload.id ? action.payload : layout
        )
      }, activity);
    }

    case 'DELETE_LAYOUT': {
      const layout = state.layouts.find(l => l.id === action.payload);
      const activity = createActivity(
        'Layout Deleted',
        `Layout "${layout?.name || action.payload}" deleted`,
        'Info'
      );
      return addActivityToState({
        ...state,
        layouts: state.layouts.filter(layout => layout.id !== action.payload)
      }, activity);
    }

    case 'UPDATE_LAYOUT_STATUS': {
      const layout = state.layouts.find(l => l.id === action.payload.id);
      const activity = createActivity(
        'Layout Status Changed',
        `Layout "${layout?.name}" status changed to ${action.payload.status}`,
        action.payload.status === 'active' ? 'Success' : 'Info'
      );
      return addActivityToState({
        ...state,
        layouts: state.layouts.map(layout =>
          layout.id === action.payload.id
            ? { ...layout, status: action.payload.status }
            : layout
        )
      }, activity);
    }

    case 'ADD_FILE': {
      const activity = createActivity(
        'File Created',
        `File "${action.payload.name}" created`,
        'Success'
      );
      return addActivityToState({
        ...state,
        files: [...state.files, action.payload]
      }, activity);
    }

    case 'UPDATE_FILE': {
      const activity = createActivity(
        'File Updated',
        `File "${action.payload.name}" updated`,
        'Info'
      );
      return addActivityToState({
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id ? action.payload : file
        )
      }, activity);
    }

    case 'DELETE_FILE': {
      const file = state.files.find(f => f.id === action.payload);
      const activity = createActivity(
        'File Deleted',
        `File "${file?.name || action.payload}" deleted`,
        'Info'
      );
      return addActivityToState({
        ...state,
        files: state.files.filter(file => file.id !== action.payload)
      }, activity);
    }

    case 'UPDATE_FILE_STATUS': {
      const file = state.files.find(f => f.id === action.payload.id);
      let newState = { ...state };

      // Create activity based on status change
      const activityStatus: ActivityStatus = 
        action.payload.status === 'active' ? 'Success' :
        action.payload.status === 'inactive' ? 'Failed' : 'Info';

      let activity = createActivity(
        'File Status Changed',
        `File "${file?.name}" status changed to ${action.payload.status}`,
        activityStatus
      );

      // If file is becoming active, create a new process
      if (action.payload.status === 'active' && file) {
        const newProcess: FileProcessingDetails = {
          processId: `proc-${Date.now()}`,
          fileId: action.payload.id,
          fileName: file.name,
          status: 'pending',
          source: file.scheduleConfig ? 'scheduled' : 'manual',
          createdAt: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3
        };
        newState = {
          ...newState,
          processes: [...newState.processes, newProcess]
        };
      }

      return addActivityToState({
        ...newState,
        files: newState.files.map(file =>
          file.id === action.payload.id
            ? { ...file, status: action.payload.status }
            : file
        )
      }, activity);
    }

    case 'ADD_PROCESS': {
      const activity = createActivity(
        'Process Started',
        `Process started for "${action.payload.fileName}"`,
        'Info'
      );
      return addActivityToState({
        ...state,
        processes: [...state.processes, action.payload]
      }, activity);
    }

    case 'UPDATE_PROCESS': {
      const activity = createActivity(
        'Process Updated',
        `Process for "${action.payload.fileName}" updated`,
        'Info'
      );
      return addActivityToState({
        ...state,
        processes: state.processes.map(process =>
          process.processId === action.payload.processId ? action.payload : process
        )
      }, activity);
    }

    case 'UPDATE_PROCESS_STATUS': {
      const process = state.processes.find(p => p.processId === action.payload.id);
      const activity = createActivity(
        'Process Status Changed',
        `Process for "${process?.fileName}" ${action.payload.status}`,
        action.payload.status === 'completed' ? 'Success' : 
        action.payload.status === 'failed' ? 'Failed' : 'Info'
      );
      return addActivityToState({
        ...state,
        processes: state.processes.map(process =>
          process.processId === action.payload.id
            ? { ...process, status: action.payload.status }
            : process
        )
      }, activity);
    }

    case 'DELETE_PROCESS': {
      const process = state.processes.find(p => p.processId === action.payload);
      const activity = createActivity(
        'Process Removed',
        `Process for "${process?.fileName}" removed`,
        'Info'
      );
      return addActivityToState({
        ...state,
        processes: state.processes.filter(process => process.processId !== action.payload)
      }, activity);
    }

    case 'ADD_ACTIVITY':
      return addActivityToState(state, action.payload);

    default:
      return state;
  }
}

// Context type definition
interface AppStateContextType {
  state: AppState;
  // Layout actions
  addLayout: (layout: Layout) => void;
  updateLayout: (layout: Layout) => void;
  deleteLayout: (id: string) => void;
  updateLayoutStatus: (id: string, status: LayoutStatus) => void;
  // File actions
  addFile: (file: FileConfiguration) => void;
  updateFile: (file: FileConfiguration) => void;
  deleteFile: (id: string) => void;
  updateFileStatus: (id: string, status: FileStatus) => void;
  // Process actions
  addProcess: (process: FileProcessingDetails) => void;
  updateProcess: (process: FileProcessingDetails) => void;
  deleteProcess: (id: string) => void;
  updateProcessStatus: (id: string, status: ProcessingStatus) => void;
}

// Create context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Create and export hook for using the context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

// Create and export provider component
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    layouts: mockLayouts,
    files: mockFiles,
    processes: mockMonitoringData,
    activities: [] // Start with empty activities
  });

  // Layout actions
  const addLayout = useCallback((layout: Layout) => {
    dispatch({ type: 'ADD_LAYOUT', payload: layout });
  }, []);

  const updateLayout = useCallback((layout: Layout) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: layout });
  }, []);

  const deleteLayout = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LAYOUT', payload: id });
  }, []);

  const updateLayoutStatus = useCallback((id: string, status: LayoutStatus) => {
    dispatch({ type: 'UPDATE_LAYOUT_STATUS', payload: { id, status } });
  }, []);

  // File actions
  const addFile = useCallback((file: FileConfiguration) => {
    dispatch({ type: 'ADD_FILE', payload: file });
  }, []);

  const updateFile = useCallback((file: FileConfiguration) => {
    dispatch({ type: 'UPDATE_FILE', payload: file });
  }, []);

  const deleteFile = useCallback((id: string) => {
    dispatch({ type: 'DELETE_FILE', payload: id });
  }, []);

  const updateFileStatus = useCallback((id: string, status: FileStatus) => {
    dispatch({ type: 'UPDATE_FILE_STATUS', payload: { id, status } });
  }, []);

  // Process actions
  const addProcess = useCallback((process: FileProcessingDetails) => {
    dispatch({ type: 'ADD_PROCESS', payload: process });
  }, []);

  const updateProcess = useCallback((process: FileProcessingDetails) => {
    dispatch({ type: 'UPDATE_PROCESS', payload: process });
  }, []);

  const deleteProcess = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROCESS', payload: id });
  }, []);

  const updateProcessStatus = useCallback((id: string, status: ProcessingStatus) => {
    dispatch({ type: 'UPDATE_PROCESS_STATUS', payload: { id, status } });
  }, []);

  const value = {
    state,
    addLayout,
    updateLayout,
    deleteLayout,
    updateLayoutStatus,
    addFile,
    updateFile,
    deleteFile,
    updateFileStatus,
    addProcess,
    updateProcess,
    deleteProcess,
    updateProcessStatus
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}