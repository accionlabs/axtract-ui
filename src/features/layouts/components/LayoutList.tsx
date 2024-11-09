// src/features/layoutManager/components/LayoutList.tsx
import { Layout } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface LayoutListProps {
  layouts: Layout[];
  onEdit: (layout: Layout) => void;
  onDelete: (layout: Layout) => void;
}

export default function LayoutList({ layouts, onEdit, onDelete }: LayoutListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout List</CardTitle>
      </CardHeader>
      <CardContent>
        {layouts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No layouts found. Create your first layout to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {layouts.map((layout) => (
                <TableRow key={layout.id}>
                  <TableCell className="font-medium">{layout.name}</TableCell>
                  <TableCell>v{layout.version}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${layout.status === 'active' ? 'bg-green-100 text-green-800' :
                        layout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                      {layout.status.charAt(0).toUpperCase() + layout.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(layout.lastModified).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(layout)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(layout)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}