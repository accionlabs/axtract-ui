// src/features/monitoring/components/MonitoringStats.tsx

import { useMemo } from 'react';
import { FileProcessingDetails } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, 
  AlertCircle, 
  Clock, 
  Activity
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface MonitoringStatsProps {
  processes: FileProcessingDetails[];
  isLoading?: boolean;
}

export function MonitoringStats({ processes, isLoading = false }: MonitoringStatsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalProcesses = processes.length;
    const completedProcesses = processes.filter(p => p.status === 'completed').length;
    const failedProcesses = processes.filter(p => p.status === 'failed').length;
    const activeProcesses = processes.filter(p => p.status === 'processing').length;
    const pendingProcesses = processes.filter(p => p.status === 'pending').length;
    const cancelledProcesses = processes.filter(p => p.status === 'cancelled').length;

    const successRate = totalProcesses > 0
      ? (completedProcesses / totalProcesses) * 100
      : 0;

    // Calculate processing times for completed processes
    const processingTimes = processes
      .filter(p => p.status === 'completed' && p.startTime && p.endTime)
      .map(p => new Date(p.endTime!).getTime() - new Date(p.startTime!).getTime());

    const averageProcessingTime = processingTimes.length > 0
      ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length / 1000)
      : 0;

    return {
      totalProcesses,
      completedProcesses,
      failedProcesses,
      activeProcesses,
      pendingProcesses,
      cancelledProcesses,
      successRate: Math.round(successRate),
      averageProcessingTime
    };
  }, [processes]);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    progress 
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    trend?: {
      value: number;
      label: string;
    };
    progress?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-48" />
            {progress !== undefined && <Skeleton className="h-2 w-full mt-3" />}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center space-x-1 text-xs">
                <span className={trend.value >= 0 ? "text-green-500" : "text-red-500"}>
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="h-2 mt-3" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 monitoring-stats">
      <StatCard
        title="Active Processes"
        value={stats.activeProcesses}
        description={`${stats.pendingProcesses} pending in queue`}
        icon={Activity}
        progress={(stats.activeProcesses / Math.max(stats.totalProcesses, 1)) * 100}
      />
      <StatCard
        title="Success Rate"
        value={`${stats.successRate}%`}
        description={`${stats.completedProcesses} completed successfully`}
        icon={FileCheck}
        progress={stats.successRate}
      />
      <StatCard
        title="Failed Processes"
        value={stats.failedProcesses}
        description={`${stats.cancelledProcesses} cancelled by user`}
        icon={AlertCircle}
        progress={(stats.failedProcesses / Math.max(stats.totalProcesses, 1)) * 100}
      />
      <StatCard
        title="Average Time"
        value={`${Math.floor(stats.averageProcessingTime / 60)}m ${stats.averageProcessingTime % 60}s`}
        description={`Based on ${stats.completedProcesses} completed processes`}
        icon={Clock}
      />
    </div>
  );
}