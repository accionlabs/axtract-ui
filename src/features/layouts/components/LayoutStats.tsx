// src/features/layouts/components/LayoutStats.tsx

import { Layout, LayoutType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { FileText, FileCheck, AlertCircle, Clock } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAppState } from '@/context/AppStateContext';

interface LayoutStatsProps {
  layouts: Layout[];
}

export default function LayoutStats({ layouts }: LayoutStatsProps) {
  const { state: { files, activities } } = useAppState();

  // Calculate statistics with active file references
  const statsWithFiles = {
    total: layouts.length,
    active: layouts.filter(l => l.status === 'active').length,
    pending: layouts.filter(l => l.status === 'pending').length,
    draft: layouts.filter(l => l.status === 'draft').length,
    // Count files using each layout type
    filesUsingLayouts: layouts.reduce((acc, layout) => {
      acc[layout.id] = files.filter(f => f.layoutId === layout.id).length;
      return acc;
    }, {} as Record<string, number>),
    // Get recent activity count
    recentChanges: activities
      .filter(a => a.type.toLowerCase().includes('layout'))
      .length
  };

  // Calculate type distribution
  const typeDistribution = layouts.reduce((acc, layout) => {
    acc[layout.type] = (acc[layout.type] || 0) + 1;
    return acc;
  }, {} as Record<LayoutType, number>);

  // Calculate completion percentage
  const completionPercentage = (statsWithFiles.active / Math.max(statsWithFiles.total, 1)) * 100;

  // Get most recent modification
  const mostRecentUpdate = layouts.length
    ? new Date(Math.max(...layouts.map(l => new Date(l.lastModified).getTime())))
    : null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    progress,
    tooltip
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    progress?: number;
    tooltip?: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {value}
                </div>
                {description && (
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
                {progress !== undefined && (
                  <Progress value={progress} className="h-2 mt-3" />
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Layouts"
          value={statsWithFiles.total}
          description={`${layouts.reduce((sum, l) => sum + l.fields.length, 0)} total fields configured`}
          icon={FileText}
          progress={completionPercentage}
          tooltip={`${statsWithFiles.active} layouts active out of ${statsWithFiles.total}`}
        />

        <StatCard
          title="Active Layouts"
          value={statsWithFiles.active}
          description={`${Object.values(statsWithFiles.filesUsingLayouts).reduce((a, b) => a + b, 0)} files using layouts`}
          icon={FileCheck}
          tooltip="Layouts currently in use by files"
        />

        <StatCard
          title="Pending Review"
          value={statsWithFiles.pending}
          description={statsWithFiles.pending === 1 ? "1 layout awaiting review" : `${statsWithFiles.pending} layouts awaiting review`}
          icon={Clock}
          tooltip="Layouts waiting for approval"
        />

        <StatCard
          title="Draft Layouts"
          value={statsWithFiles.draft}
          description={mostRecentUpdate ? `Last updated ${formatDate(mostRecentUpdate)}` : "No drafts yet"}
          icon={AlertCircle}
          tooltip="Layouts in draft state"
        />
      </div>

      {/* Layout Type Distribution */}
      {layouts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Layout Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Object.keys(typeDistribution) as LayoutType[]).map(type => {
                  const count = typeDistribution[type] || 0;
                  const percentage = (count / statsWithFiles.total) * 100;
                  const activeCount = layouts.filter(l => l.type === type && l.status === 'active').length;

                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize flex items-center gap-2">
                          {type}
                          {activeCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {activeCount} active
                            </Badge>
                          )}
                        </span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities
                  .filter(activity => activity.type.toLowerCase().includes('layout'))
                  .slice(0, 3)
                  .map(activity => (
                    <div key={activity.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-muted-foreground">{activity.details}</p>
                      </div>
                      <Badge variant="secondary">
                        {formatDate(new Date(activity.timestamp))}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}