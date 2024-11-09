// src/features/schedules/components/ScheduleFormDialog.tsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Clock, Calendar, Bell } from 'lucide-react';
import { ScheduleConfiguration, WeekDay } from '../types';
import { commonTimezones, weekDayOptions, monthDayOptions, mockFiles } from '../mockData';

const scheduleFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    fileId: z.string().min(1, 'File selection is required'),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    timezone: z.string().min(1, 'Timezone is required'),
    weekDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const)).optional(),
    monthDays: z.array(z.number()).optional(),
    retryConfig: z.object({
        maxAttempts: z.number().min(1).max(10),
        delayMinutes: z.number().min(1).max(60)
    }).optional(),
    notifyOnSuccess: z.boolean(),
    notifyOnFailure: z.boolean(),
    notificationEmails: z.array(z.string().email())
}).refine(data => {
    if (data.frequency === 'weekly' && (!data.weekDays || data.weekDays.length === 0)) {
        return false;
    }
    if (data.frequency === 'monthly' && (!data.monthDays || data.monthDays.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Please select days for the schedule to run",
    path: ['weekDays']
});

type FormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: Partial<ScheduleConfiguration>) => void;
    initialData?: ScheduleConfiguration | null;
}

export default function ScheduleFormDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData
}: ScheduleFormDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            fileId: initialData?.fileId || '',
            frequency: initialData?.frequency || 'daily',
            time: initialData?.time || '00:00',
            timezone: initialData?.timezone || 'UTC',
            weekDays: initialData?.weekDays || [],
            monthDays: initialData?.monthDays || [],
            retryConfig: initialData?.retryConfig || {
                maxAttempts: 3,
                delayMinutes: 15
            },
            notifyOnSuccess: initialData?.notifyOnSuccess || false,
            notifyOnFailure: initialData?.notifyOnFailure || true,
            notificationEmails: initialData?.notificationEmails || []
        }
    });

    const [newEmail, setNewEmail] = React.useState('');

    // Reset form when initialData changes or dialog opens
    React.useEffect(() => {
        if (open) {
            if (initialData) {
                console.log('Setting form data:', initialData); // Debug log
                form.reset({
                    name: initialData.name,
                    description: initialData.description,
                    fileId: initialData.fileId,
                    frequency: initialData.frequency,
                    time: initialData.time,
                    timezone: initialData.timezone,
                    weekDays: initialData.weekDays || [],
                    monthDays: initialData.monthDays || [],
                    retryConfig: {
                        maxAttempts: initialData.retryConfig?.maxAttempts || 3,
                        delayMinutes: initialData.retryConfig?.delayMinutes || 15
                    },
                    notifyOnSuccess: initialData.notifyOnSuccess || false,
                    notifyOnFailure: initialData.notifyOnFailure || true,
                    notificationEmails: initialData.notificationEmails || []
                });
            } else {
                // Reset to default values when creating new schedule
                form.reset({
                    name: '',
                    description: '',
                    fileId: '',
                    frequency: 'daily',
                    time: '00:00',
                    timezone: 'UTC',
                    weekDays: [],
                    monthDays: [],
                    retryConfig: {
                        maxAttempts: 3,
                        delayMinutes: 15
                    },
                    notifyOnSuccess: false,
                    notifyOnFailure: true,
                    notificationEmails: []
                });
            }
        }
    }, [open, initialData, form.reset]);

    const addEmail = () => {
        if (newEmail && newEmail.includes('@')) {
            const currentEmails = form.getValues('notificationEmails');
            form.setValue('notificationEmails', [...currentEmails, newEmail]);
            setNewEmail('');
        }
    };

    const removeEmail = (email: string) => {
        const currentEmails = form.getValues('notificationEmails');
        form.setValue('notificationEmails', currentEmails.filter(e => e !== email));
    };

    const handleSubmit = (data: FormValues) => {
        const scheduleData: Partial<ScheduleConfiguration> = {
            ...data,
            weekDays: data.weekDays as WeekDay[],
        };
        onSubmit(scheduleData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{initialData ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
                    <DialogDescription>
                        Configure when and how your file should be processed.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Schedule Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter schedule name" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Describe the purpose of this schedule" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="fileId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Select File</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a file to schedule" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {mockFiles.map(file => (
                                                            <SelectItem key={file.id} value={file.id}>
                                                                {file.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Schedule Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Schedule Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="frequency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Frequency</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                                    {form.watch('frequency') === 'weekly' && (
                                        <FormField
                                            control={form.control}
                                            name="weekDays"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Select Days</FormLabel>
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
                                                                    form.setValue('weekDays', newValue);
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

                                    {form.watch('frequency') === 'monthly' && (
                                        <FormField
                                            control={form.control}
                                            name="monthDays"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Select Days of Month</FormLabel>
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
                                                                    form.setValue('monthDays', newValue);
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="time"
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

                                        <FormField
                                            control={form.control}
                                            name="timezone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Timezone</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {commonTimezones.map(tz => (
                                                                <SelectItem key={tz.value} value={tz.value}>
                                                                    {tz.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Retry Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Retry Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="retryConfig.maxAttempts"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Retry Attempts</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} min={1} max={10} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="retryConfig.delayMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Delay Between Retries (minutes)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} min={1} max={60} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Notifications</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex space-x-4">
                                        <FormField
                                            control={form.control}
                                            name="notifyOnSuccess"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>Notify on Success</FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="notifyOnFailure"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>Notify on Failure</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notificationEmails"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notification Recipients</FormLabel>
                                                <div className="space-y-4">
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
                                                        {field.value.map((email) => (
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
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={form.handleSubmit(handleSubmit)}
                        disabled={!form.formState.isValid}
                    >
                        {initialData ? 'Update Schedule' : 'Create Schedule'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}