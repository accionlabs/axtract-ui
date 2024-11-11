// src/features/dashboard/Dashboard.tsx

import { BarChart, PieChart, Activity, FileText, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';
import StatCard from './components/StatCard';
import RecentActivity from './components/RecentActivity';
import { useAppState } from '@/context/AppStateContext';
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type TrendStatus = 'positive' | 'negative';
type DashboardStat = {
  title: string;
  value: string | number;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  trend?: {
    value: number;
    label: string;
    status?: TrendStatus;
  };
  progress?: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const { layouts, files, processes, activities } = state;

  // Calculate layout statistics
  const layoutStats = {
    total: layouts.length,
    active: layouts.filter(l => l.status === 'active').length,
    pending: layouts.filter(l => l.status === 'pending').length,
    draft: layouts.filter(l => l.status === 'draft').length,
    avgFields: layouts.length > 0 
      ? Math.round(layouts.reduce((sum, l) => sum + l.fields.length, 0) / layouts.length)
      : 0
  };

  // Calculate file statistics
  const fileStats = {
    total: files.length,
    active: files.filter(f => f.status === 'active').length,
    scheduled: files.filter(f => f.scheduleConfig).length,
    runningToday: files.filter(f => {
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

  // Calculate process statistics
  const processStats = {
    active: processes.filter(p => p.status === 'processing').length,
    pending: processes.filter(p => p.status === 'pending').length,
    completed: processes.filter(p => p.status === 'completed').length,
    failed: processes.filter(p => p.status === 'failed').length,
    successRate: processes.length > 0
      ? Math.round((processes.filter(p => p.status === 'completed').length / processes.length) * 100)
      : 0
  };

  // Calculate trend data
  const getTrend = () => {
    const recentActivities = activities.slice(0, 20);
    const successCount = recentActivities.filter(a => a.status === 'Success').length;
    const failureCount = recentActivities.filter(a => a.status === 'Failed').length;
    const trend = successCount - failureCount;
    
    return {
      value: trend,
      direction: trend >= 0 ? 'up' : 'down',
      status: trend >= 0 ? 'positive' : 'negative'
    };
  };

  const trend = getTrend();

  const formatPercentage = (value: number): number => {
    return Number(value.toFixed(1)); // This will round to 1 decimal place
  };

  // Main stats cards configuration
  const stats: DashboardStat[] = [
    {
      title: 'Layouts',
      value: layoutStats.total,
      subtitle: `${layoutStats.active} active, ${layoutStats.pending} pending`,
      description: `Average ${layoutStats.avgFields} fields per layout`,
      icon: FileText,
      onClick: () => navigate(ROUTES.LAYOUT_MANAGER),
      trend: {
        value: formatPercentage(layoutStats.active / Math.max(layoutStats.total, 1) * 100),
        label: 'completion rate',
        status: layoutStats.active > layoutStats.draft ? 'positive' : 'negative'
      }
    },
    {
      title: 'Files',
      value: fileStats.active,
      subtitle: `${fileStats.scheduled} scheduled`,
      description: `${fileStats.runningToday} running today`,
      icon: BarChart,
      onClick: () => navigate(ROUTES.FILE_MANAGER),
      trend: {
        value: (fileStats.active / Math.max(fileStats.total, 1)) * 100,
        label: 'active rate',
        status: fileStats.active > 0 ? 'positive' : 'negative'
      }
    },
    {
      title: 'Success Rate',
      value: `${processStats.successRate}%`,
      subtitle: 'Last 24 hours',
      description: `${processStats.completed} completed, ${processStats.failed} failed`,
      icon: PieChart,
      progress: processStats.successRate,
      trend: {
        value: processStats.successRate,
        label: 'success rate',
        status: processStats.successRate >= 80 ? 'positive' : 'negative'
      }
    },
    {
      title: 'Active Processes',
      value: processStats.active,
      subtitle: `${processStats.pending} pending`,
      description: `${processes.length} total processes`,
      icon: Activity,
      onClick: () => navigate(ROUTES.MONITORING),
      trend: {
        value: trend.value,
        label: trend.direction === 'up' ? 'improvement' : 'decline',
        status: trend.direction === 'up' ? 'positive' : 'negative'
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your layouts, files, and processing status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {/* Processing Overview */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Processing Overview</CardTitle>
            <CardDescription>Active file processing status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Processing Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active</span>
                  <span className="font-medium">{processStats.active}</span>
                </div>
                <Progress 
                  value={(processStats.active / Math.max(processes.length, 1)) * 100}
                  className="bg-blue-100"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending</span>
                  <span className="font-medium">{processStats.pending}</span>
                </div>
                <Progress 
                  value={(processStats.pending / Math.max(processes.length, 1)) * 100}
                  className="bg-yellow-100"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">{processStats.completed}</span>
                </div>
                <Progress 
                  value={(processStats.completed / Math.max(processes.length, 1)) * 100}
                  className="bg-green-100"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Failed</span>
                  <span className="font-medium">{processStats.failed}</span>
                </div>
                <Progress 
                  value={(processStats.failed / Math.max(processes.length, 1)) * 100}
                  className="bg-red-100"
                />
              </div>
            </div>

            {/* Active Files */}
            <div className="space-y-4">
              <h4 className="font-medium">Active Files</h4>
              <div className="space-y-2">
                {files.filter(f => f.status === 'active').slice(0, 5).map(file => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{file.name}</span>
                      {file.scheduleConfig && (
                        <Badge variant="secondary" className="text-xs">
                          {file.scheduleConfig.frequency}
                        </Badge>
                      )}
                    </div>
                    <Badge className={cn(
                      "capitalize",
                      file.status === 'active' && "bg-green-100 text-green-800",
                      file.status === 'inactive' && "bg-red-100 text-red-800",
                      file.status === 'draft' && "bg-gray-100 text-gray-800"
                    )}>
                      {file.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={activities.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}