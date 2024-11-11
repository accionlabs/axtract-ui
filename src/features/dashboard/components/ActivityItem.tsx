// src/features/dashboard/components/ActivityItem.tsx
import { Activity } from '../types';
import StatusIndicator from './StatusIndicator';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-4">
      <StatusIndicator status={activity.status} />
      <div>
        <p className="font-medium">{activity.type}</p>
        <p className="text-sm text-gray-500">{activity.details}</p>
      </div>
    </div>
    <span className="text-sm text-gray-500">{activity.timestamp}</span>
  </div>
);

export default ActivityItem;