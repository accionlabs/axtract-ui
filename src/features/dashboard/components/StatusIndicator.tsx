// src/features/dashboard/components/StatusIndicator.tsx

import { ActivityStatus } from '../types';

interface StatusIndicatorProps {
  status: ActivityStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const colors = {
    Success: 'bg-green-500',
    Failed: 'bg-red-500',
    Info: 'bg-blue-500'
  };

  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
};

export default StatusIndicator;