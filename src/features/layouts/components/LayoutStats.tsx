import { Layout } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface LayoutStatsProps {
  layouts: Layout[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: JSX.Element;
  progress?: number;
}

const StatCard = ({ title, value, description, icon, progress }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {progress !== undefined && (
          <Progress value={progress} className="h-2" />
        )}
      </div>
    </CardContent>
  </Card>
);

export default function LayoutStats({ layouts }: LayoutStatsProps) {
  // Calculate various statistics
  const totalLayouts = layouts.length;
  const activeLayouts = layouts.filter(l => l.status === 'active').length;
  const pendingLayouts = layouts.filter(l => l.status === 'pending').length;
  const draftLayouts = layouts.filter(l => l.status === 'draft').length;

  // Calculate total fields across all layouts
  const totalFields = layouts.reduce((sum, layout) => sum + layout.fields.length, 0);
  
  // Calculate average fields per layout
  const avgFieldsPerLayout = totalLayouts ? Math.round(totalFields / totalLayouts) : 0;

  // Calculate completion percentage
  const completionPercentage = totalLayouts ? Math.round((activeLayouts / totalLayouts) * 100) : 0;

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Total Layouts"
                  value={totalLayouts}
                  description={`${totalFields} total fields configured`}
                  icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                  progress={completionPercentage}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average of {avgFieldsPerLayout} fields per layout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <StatCard
          title="Active Layouts"
          value={activeLayouts}
          description={`${((activeLayouts / totalLayouts) * 100).toFixed(1)}% of total layouts`}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        />

        <StatCard
          title="Pending Review"
          value={pendingLayouts}
          description={pendingLayouts === 1 ? "1 layout awaiting review" : `${pendingLayouts} layouts awaiting review`}
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
        />

        <StatCard
          title="Draft Layouts"
          value={draftLayouts}
          description={mostRecentUpdate ? `Last updated ${formatDate(mostRecentUpdate)}` : "No drafts yet"}
          icon={<AlertCircle className="h-4 w-4 text-blue-500" />}
        />
      </div>

      {layouts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Layout Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(['claims', 'eligibility', 'wellness'] as const).map(type => {
                  const count = layouts.filter(l => l.type === type).length;
                  const percentage = (count / totalLayouts) * 100;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {layouts
                  .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                  .slice(0, 3)
                  .map(layout => (
                    <div key={layout.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{layout.name}</p>
                        <p className="text-muted-foreground">{layout.fields.length} fields configured</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">
                          {formatDate(new Date(layout.lastModified))}
                        </p>
                      </div>
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