// src/features/dashboard/components/RecentActivity.tsx
import { Activity } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityItem from './ActivityItem';

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default RecentActivity;