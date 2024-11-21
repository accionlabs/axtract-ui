// src/features/source-manager/components/DataSourceStats.tsx

import { DataSource } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  FileText, 
  Globe
} from 'lucide-react';

interface DataSourceStatsProps {
  sources: DataSource[];
}

export default function DataSourceStats({ sources }: DataSourceStatsProps) {
  const stats = {
    total: sources.length,
    active: sources.filter(s => s.status === 'active').length,
    error: sources.filter(s => s.status === 'error').length,
    byType: {
      database: sources.filter(s => s.type === 'database').length,
      file: sources.filter(s => s.type === 'file').length,
      api: sources.filter(s => s.type === 'api').length
    },
    successRate: sources.length > 0
      ? (sources.filter(s => s.status === 'active').length / sources.length) * 100
      : 0
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon,
    progress
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
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
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          {progress !== undefined && (
            <Progress value={progress} className="h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Sources"
        value={stats.total}
        subtitle={`${stats.active} active, ${stats.error} with errors`}
        icon={Database}
        progress={stats.successRate}
      />

      <StatCard
        title="Database Sources"
        value={stats.byType.database}
        subtitle={`${sources.filter(s => s.type === 'database' && s.status === 'active').length} active`}
        icon={Database}
      />

      <StatCard
        title="File Sources"
        value={stats.byType.file}
        subtitle={`${sources.filter(s => s.type === 'file' && s.status === 'active').length} active`}
        icon={FileText}
      />

      <StatCard
        title="API Sources"
        value={stats.byType.api}
        subtitle={`${sources.filter(s => s.type === 'api' && s.status === 'active').length} active`}
        icon={Globe}
      />

      {stats.error > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sources
                .filter(s => s.status === 'error')
                .map(source => (
                  <div 
                    key={source.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {source.type === 'database' && <Database className="h-4 w-4" />}
                      {source.type === 'file' && <FileText className="h-4 w-4" />}
                      {source.type === 'api' && <Globe className="h-4 w-4" />}
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last tested: {new Date(source.lastTestAt!).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-red-600 text-sm">Connection failed</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}