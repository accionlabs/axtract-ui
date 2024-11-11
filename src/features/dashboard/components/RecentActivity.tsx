// src/features/dashboard/components/RecentActivity.tsx

import { Activity } from '../types';
import ActivityItem from './ActivityItem';

interface RecentActivityProps {
  activities: Activity[];
  showHeader?: boolean; // Add this prop
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities,
  showHeader = true // Default to true for backwards compatibility
}) => (
  <div className="space-y-4">
    {showHeader && <h2 className="text-xl font-semibold">Recent Activity</h2>}
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm">No recent activity</p>
      ) : (
        activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))
      )}
    </div>
  </div>
);

export default RecentActivity;