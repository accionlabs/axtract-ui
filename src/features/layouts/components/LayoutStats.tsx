// src/features/layouts/components/LayoutStats.tsx

import { Layout } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LayoutStatsProps {
  layouts: Layout[];
}

export default function LayoutStats({ layouts }: LayoutStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Layouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {layouts.filter(l => l.status === 'active').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {layouts.filter(l => l.status === 'pending').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Draft Layouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {layouts.filter(l => l.status === 'draft').length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}