// src/features/files/components/form-tabs/NotificationsTab.tsx

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormSchema } from '../FileFormDialog';
import { useState } from 'react';

interface NotificationsTabProps {
  form: UseFormReturn<FormSchema>;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export function NotificationsTab({
  form,
  showNotifications,
  setShowNotifications
}: NotificationsTabProps) {
  const [newEmail, setNewEmail] = useState('');

  const addEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      const currentEmails = form.watch('notificationConfig.notificationEmails') || [];
      form.setValue('notificationConfig.notificationEmails', [...currentEmails, newEmail], {
        shouldValidate: true
      });
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    const currentEmails = form.watch('notificationConfig.notificationEmails') || [];
    form.setValue(
      'notificationConfig.notificationEmails',
      currentEmails.filter(e => e !== email),
      { shouldValidate: true }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications Configuration</CardTitle>
        <Switch
          checked={showNotifications}
          onCheckedChange={(checked) => {
            setShowNotifications(checked);
            if (checked && !form.getValues('notificationConfig')) {
              // Initialize notification config with defaults when enabled
              form.setValue('notificationConfig', {
                notifyOnSuccess: false,
                notifyOnFailure: true,
                notificationEmails: [],
                retryConfig: {
                  maxAttempts: 3,
                  delayMinutes: 15
                }
              });
            }
          }}
        />
      </CardHeader>
      {showNotifications && (
        <CardContent className="space-y-6">
          {/* Notification Triggers */}
          <div className="flex space-x-6">
            <FormField
              control={form.control}
              name="notificationConfig.notifyOnSuccess"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Notify on Success</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationConfig.notifyOnFailure"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Notify on Failure</FormLabel>
                </FormItem>
              )}
            />
          </div>

          {/* Retry Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Retry Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notificationConfig.retryConfig.maxAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Retry Attempts</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notificationConfig.retryConfig.delayMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Between Retries (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Email Recipients */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Recipients</h4>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addEmail}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(form.watch('notificationConfig.notificationEmails') || []).map((email) => (
                <Badge
                  key={email}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {email}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeEmail(email)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}