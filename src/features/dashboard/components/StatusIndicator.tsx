// src/features/dashboard/components/StatusIndicator.tsx
import { Activity } from '../../../types';

interface StatusIndicatorProps {
  status: Activity['status'];
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