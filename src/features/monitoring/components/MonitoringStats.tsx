// src/features/monitoring/components/MonitoringStats.tsx

import { MonitoringStatsData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileCheck, AlertCircle, Clock, Activity } from "lucide-react";
import { formatDuration } from "../mockData";
import { Skeleton } from "@/components/ui/skeleton";

interface MonitoringStatsProps {
  stats: MonitoringStatsData;
  isLoading?: boolean;
}

export function MonitoringStats({ stats, isLoading = false }: MonitoringStatsProps) {
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

  const statsData = [
    {
      title: "Files in Progress",
      value: stats.filesInProgress,
      description: `${stats.filesInProgress} files currently being processed`,
      icon: Loader2,
      progress: (stats.filesInProgress / stats.totalFiles) * 100
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      description: `${stats.completedToday} files completed today`,
      icon: FileCheck,
      progress: stats.successRate,
      trend: {
        value: 2.5, // This would come from backend comparing to previous period
        label: "vs last period"
      }
    },
    {
      title: "Failed Files",
      value: stats.failedFiles,
      description: `${((stats.failedFiles / stats.totalFiles) * 100).toFixed(1)}% failure rate`,
      icon: AlertCircle,
      progress: (stats.failedFiles / stats.totalFiles) * 100
    },
    {
      title: "Average Processing Time",
      value: formatDuration(stats.averageProcessingTime),
      description: `Based on ${stats.totalFiles} total files`,
      icon: Clock
    },
    {
      title: "Throughput",
      value: stats.completedToday,
      description: "Files completed in last 24 hours",
      icon: Activity,
      trend: {
        value: 5.2, // This would come from backend
        label: "vs previous day"
      }
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Loading state component
export function MonitoringStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-2 w-full mt-3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}