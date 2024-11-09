// src/features/schedules/ScheduleManager.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { ScheduleConfiguration } from './types';
import { mockSchedules } from './mockData';
import { ScheduleStats, ScheduleList, ScheduleFormDialog } from './components';

export default function ScheduleManager() {
  const [schedules, setSchedules] = React.useState<ScheduleConfiguration[]>(mockSchedules);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState<ScheduleConfiguration | null>(null);
  const { toast } = useToast();

  const handleCreateSchedule = (data: Partial<ScheduleConfiguration>) => {
    if (selectedSchedule) {
      // Update existing schedule
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === selectedSchedule.id
            ? { ...schedule, ...data, updatedAt: new Date().toISOString() }
            : schedule
        )
      );
      toast({
        title: "Schedule Updated",
        description: "Schedule has been updated successfully."
      });
    } else {
      // Create new schedule
      const newSchedule: ScheduleConfiguration = {
        ...data,
        id: `schedule-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
      } as ScheduleConfiguration;

      setSchedules(prev => [...prev, newSchedule]);
      toast({
        title: "Schedule Created",
        description: "New schedule has been created successfully."
      });
    }
    handleDialogClose();
  };

  const handleEditSchedule = (schedule: ScheduleConfiguration) => {
    console.log('Editing schedule:', schedule); // Debug log
    setSelectedSchedule(schedule);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteSchedule = (schedule: ScheduleConfiguration) => {
    setSchedules(prev => prev.filter(s => s.id !== schedule.id));
    toast({
      title: "Schedule Deleted",
      description: "Schedule has been deleted successfully.",
      variant: "destructive"
    });
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedSchedule(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedule Manager</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Schedule
        </Button>
      </div>

      <ScheduleStats schedules={schedules} />

      <ScheduleList
        schedules={schedules}
        onEdit={handleEditSchedule}
        onDelete={handleDeleteSchedule}
      />

      <ScheduleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
          else setIsCreateDialogOpen(true);
        }}
        onSubmit={handleCreateSchedule}
        initialData={selectedSchedule}
      />
    </div>
  );
}