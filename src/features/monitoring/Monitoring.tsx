// src/features/monitoring/components/Monitoring.tsx

// src/features/monitoring/Monitoring.tsx

import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { MonitoringFilters } from './types';
import { MonitoringStats, MonitoringFiltersBar, MonitoringTable } from './components';
import { useAppState } from '@/context/AppStateContext';
import { initialFilters } from './mockData';

export function Monitoring() {
  // Get state and actions from context
  const { 
    state: { processes, files },
    updateProcessStatus,
    updateFileStatus 
  } = useAppState();
  
  // Local state
  const [isLoading, setIsLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<MonitoringFilters>(initialFilters);
  const [processToCancel, setProcessToCancel] = React.useState<string | null>(null);
  const { toast } = useToast();

  // Filter data
  const filteredData = React.useMemo(() => {
    let filtered = [...processes];

    // Apply filters
    if (filters.fileName) {
      const searchTerm = filters.fileName.toLowerCase();
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status?.length) {
      filtered = filtered.filter(file => 
        filters.status!.includes(file.status)
      );
    }

    if (filters.source?.length) {
      filtered = filtered.filter(file => 
        filters.source!.includes(file.source)
      );
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.startTime || file.createdAt);
        return fileDate >= start && fileDate <= end;
      });
    }

    // Sort by most recent first
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime || a.createdAt).getTime();
      const dateB = new Date(b.startTime || b.createdAt).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [processes, filters]);

  // Paginated data
  const paginatedData = React.useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, filters.page, filters.pageSize]);

  // Filter change handler
  const handleFiltersChange = (newFilters: Partial<MonitoringFilters>) => {
    setFilters(current => ({
      ...current,
      ...newFilters,
      // Reset to first page when filters change (except for page changes)
      page: 'page' in newFilters ? newFilters.page || 1 : 1
    }));
  };

  // Retry handler
  const handleRetry = async (processId: string) => {
    setIsLoading(true);
    try {
      const process = processes.find(p => p.processId === processId);
      if (!process) throw new Error('Process not found');

      // Update process status to pending
      updateProcessStatus(processId, 'pending');

      // Simulate processing
      setTimeout(() => {
        updateProcessStatus(processId, 'processing');
        
        // Simulate completion after random time
        setTimeout(() => {
          const success = Math.random() > 0.3; // 70% success rate
          updateProcessStatus(processId, success ? 'completed' : 'failed');
        }, Math.random() * 3000 + 2000);
      }, 1000);

      toast({
        title: "Process Retry Initiated",
        description: `Process ${processId} has been queued for retry.`
      });
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: "Failed to initiate retry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel handlers
  const handleCancelInitiate = (processId: string) => {
    setProcessToCancel(processId);
  };

  const handleCancelConfirm = async () => {
    if (!processToCancel) return;

    setIsLoading(true);
    try {
      const process = processes.find(p => p.processId === processToCancel);
      if (!process) throw new Error('Process not found');

      // Update process status
      updateProcessStatus(processToCancel, 'cancelled');
      
      // Update associated file status if exists
      if (process.fileId) {
        const file = files.find(f => f.id === process.fileId);
        if (file && file.status === 'active') {
          updateFileStatus(file.id, 'inactive');
        }
      }

      toast({
        title: "Process Cancelled",
        description: `Process ${processToCancel} has been cancelled.`
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel the process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessToCancel(null);
      setIsLoading(false);
    }
  };

  // Auto-refresh functionality
  React.useEffect(() => {
    const autoUpdateProcess = () => {
      processes.forEach(process => {
        if (process.status === 'processing') {
          // Randomly complete or fail processes
          if (Math.random() > 0.7) { // 30% chance to complete/fail
            const success = Math.random() > 0.2; // 80% success rate
            updateProcessStatus(
              process.processId, 
              success ? 'completed' : 'failed'
            );
          }
        }
      });
    };

    const interval = setInterval(autoUpdateProcess, 5000);
    return () => clearInterval(interval);
  }, [processes, updateProcessStatus]);

  // Manual refresh handler
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className={cn(
            "h-4 w-4 mr-2",
            isLoading && "animate-spin"
          )} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <MonitoringStats 
        processes={processes}
        isLoading={isLoading} 
      />

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <MonitoringFiltersBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <MonitoringTable
            files={paginatedData}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRetry={handleRetry}
            onCancel={handleCancelInitiate}
            totalItems={filteredData.length}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog 
        open={!!processToCancel} 
        onOpenChange={(open) => !open && setProcessToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Process</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this process? This action cannot be undone.
              Any processed records will be rolled back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Cancelling..." : "Yes, cancel process"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}