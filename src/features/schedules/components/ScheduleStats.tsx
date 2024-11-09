// src/features/schedules/components/ScheduleStats.tsx
import { ScheduleConfiguration } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleStatsProps {
  schedules: ScheduleConfiguration[];
}

export default function ScheduleStats({ schedules }: ScheduleStatsProps) {
  const activeSchedules = schedules.filter(s => s.status === 'active');
  const todaySchedules = activeSchedules.filter(s => {
    const nextRun = new Date(s.nextRun || '');
    const today = new Date();
    return nextRun.toDateString() === today.toDateString();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{schedules.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {activeSchedules.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Running Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {todaySchedules.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}