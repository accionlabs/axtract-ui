// src/features/fileManager/components/FileStats.tsx
import { FileConfiguration } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FileStatsProps {
  files: FileConfiguration[];
}

export default function FileStats({ files }: FileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{files.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {files.filter(f => f.status === 'active').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Scheduled Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {files.filter(f => f.scheduleConfig).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}