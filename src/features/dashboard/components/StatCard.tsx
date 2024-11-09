import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  onClick
}: StatCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden",
        onClick && "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
}