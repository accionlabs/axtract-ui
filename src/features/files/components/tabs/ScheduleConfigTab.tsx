// src/features/files/components/form-tabs/ScheduleConfigTab.tsx

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { FormSchema } from '../FileFormDialog';
import { timezoneOptions, weekDayOptions, monthDayOptions } from '../../mockData';

interface ScheduleConfigTabProps {
  form: UseFormReturn<FormSchema>;
  showSchedule: boolean;
  setShowSchedule: (show: boolean) => void;
}

export function ScheduleConfigTab({ 
  form, 
  showSchedule, 
  setShowSchedule 
}: ScheduleConfigTabProps) {
  const frequency = form.watch('scheduleConfig.frequency');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schedule Configuration</CardTitle>
        <Switch
          checked={showSchedule}
          onCheckedChange={setShowSchedule}
        />
      </CardHeader>
      {showSchedule && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduleConfig.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduleConfig.time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="scheduleConfig.timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezoneOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {frequency === 'weekly' && (
            <FormField
              control={form.control}
              name="scheduleConfig.daysOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days of Week</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {weekDayOptions.map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={field.value?.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = field.value?.includes(day.value)
                            ? field.value.filter(d => d !== day.value)
                            : [...(field.value || []), day.value];
                          field.onChange(newValue);
                        }}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {frequency === 'monthly' && (
            <FormField
              control={form.control}
              name="scheduleConfig.daysOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days of Month</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {monthDayOptions.map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={field.value?.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = field.value?.includes(day.value)
                            ? field.value.filter(d => d !== day.value)
                            : [...(field.value || []), day.value];
                          field.onChange(newValue);
                        }}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}