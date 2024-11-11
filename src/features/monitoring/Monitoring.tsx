// src/features/monitoring/components/Monitoring.tsx

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
import { 
  mockMonitoringData, 
  calculateMockStats, 
  initialFilters 
} from './mockData';

export function Monitoring() {
  // State
  const [isLoading, setIsLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<MonitoringFilters>(initialFilters);
  const [processToCancel, setProcessToCancel] = React.useState<string | null>(null);
  const { toast } = useToast();

  // Filtered data (in real app, this would be an API call)
  const filteredData = React.useMemo(() => {
    let filtered = [...mockMonitoringData];

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
  }, [filters]);

  // Paginated data
  const paginatedData = React.useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, filters.page, filters.pageSize]);

  // Stats calculation
  const stats = React.useMemo(() => 
    calculateMockStats(filteredData), 
    [filteredData]
  );

  // Filter change handler
  const handleFiltersChange = (newFilters: Partial<MonitoringFilters>) => {
    setFilters(current => ({
      ...current,
      ...newFilters
    }));
  };

  // Retry handler
  const handleRetry = async (processId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  // Initial data fetch
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []); // Initial fetch only

  // Refresh handler
  const handleRefresh = () => {
    fetchData();
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
      <MonitoringStats stats={stats} isLoading={isLoading} />

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