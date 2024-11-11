// src/features/dashboard/components/StatCard.tsx

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  description?: string;
  icon: LucideIcon;
  progress?: number;
  trend?: {
    value: number;
    label: string;
    status?: 'positive' | 'negative';
  };
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  progress,
  trend,
  className,
  onClick
}: StatCardProps) {
  const formatTrendValue = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span className={cn(
                "text-sm font-medium",
                trend.status === 'positive' && "text-green-600",
                trend.status === 'negative' && "text-red-600"
              )}>
                {formatTrendValue(trend.value)}
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>

          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}

          {progress !== undefined && (
            <Progress 
              value={progress} 
              className="h-1 mt-4" 
            />
          )}
        </div>

        {onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
}