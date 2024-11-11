// src/features/dashboard/Dashboard.tsx

import { BarChart, PieChart, Activity, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';
import StatCard from './components/StatCard';
import RecentActivity from './components/RecentActivity';
import { useDashboardStats } from '@/context/AppStateContext';

export default function Dashboard() {
  const navigate = useNavigate();
  // Use all the data from our hook, including recentActivity
  const { layouts, files, monitoring, recentActivity } = useDashboardStats();

  const stats = [
    {
      title: 'Active Layouts',
      value: layouts.active,
      subtitle: `${layouts.pending} pending approval`,
      icon: FileText,
      route: ROUTES.LAYOUT_MANAGER,
      className: 'cursor-pointer hover:shadow-lg transition-shadow'
    },
    {
      title: 'Scheduled Files',
      value: files.scheduled,
      subtitle: `${files.runningToday} running today`,
      icon: BarChart,
      route: ROUTES.FILE_MANAGER,
      className: 'cursor-pointer hover:shadow-lg transition-shadow'
    },
    {
      title: 'Success Rate',
      value: `${monitoring.successRate}%`,
      subtitle: 'Last 7 days',
      icon: PieChart
    },
    {
      title: 'Active Tasks',
      value: monitoring.activeProcesses,
      subtitle: `${monitoring.pendingProcesses} pending, ${monitoring.failedProcesses} failed`,
      icon: Activity,
      route: ROUTES.MONITORING,
      className: 'cursor-pointer hover:shadow-lg transition-shadow'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AxTract Dashboard</h1>
        <p className="text-gray-600">Self-Service Extract Tool</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            className={stat.className}
            onClick={stat.route ? () => navigate(stat.route) : undefined}
          />
        ))}
      </div>

      <div className="mb-8">
        {/* Pass the recentActivity data to the RecentActivity component */}
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}