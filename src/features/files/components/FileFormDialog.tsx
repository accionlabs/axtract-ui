// src/features/files/components/FileFormDialog.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileConfiguration, FileFormValues } from '../types';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { BasicConfigTab, DeliveryConfigTab, ScheduleConfigTab, NotificationsTab } from './tabs';

// Form validation schemas
const fileFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    layoutId: z.string().min(1, 'Layout is required'),
    format: z.enum(['CSV', 'TSV', 'FIXED']),
    sftpConfig: z.object({
        host: z.string().min(1, 'Host is required'),
        port: z.number().min(1).max(65535),
        username: z.string().min(1, 'Username is required'),
        path: z.string().min(1, 'Path is required'),
        knownHostKey: z.string().optional()
    }).optional(),
    scheduleConfig: z.object({
        frequency: z.enum(['daily', 'weekly', 'monthly']),
        time: z.string(),
        timezone: z.string(),
        daysOfWeek: z.array(z.number()).optional(),
        daysOfMonth: z.array(z.number()).optional()
    }).optional(),
    encryptionConfig: z.object({
        enabled: z.boolean(),
        type: z.literal('PGP'),
        publicKey: z.string().optional()
    }).optional(),
    notificationConfig: z.object({
        notifyOnSuccess: z.boolean(),
        notifyOnFailure: z.boolean(),
        notificationEmails: z.array(z.string().email()),
        retryConfig: z.object({
            maxAttempts: z.number().min(1).max(10),
            delayMinutes: z.number().min(1).max(60)
        }).optional()
    }).optional()
});

export type FormSchema = z.infer<typeof fileFormSchema>;

interface FileFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: FileFormValues) => void;
    initialData?: FileConfiguration | null;
}

export default function FileFormDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: FileFormDialogProps) {
    // State for active tab and feature toggles
    const [activeTab, setActiveTab] = React.useState('basic');
    const [showSftp, setShowSftp] = React.useState(false);
    const [showSchedule, setShowSchedule] = React.useState(false);
    const [showEncryption, setShowEncryption] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);

    // Initialize form with react-hook-form
    const form = useForm<FormSchema>({
        resolver: zodResolver(fileFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            layoutId: initialData?.layoutId || '',
            format: initialData?.format || 'CSV',
            sftpConfig: initialData?.sftpConfig,
            scheduleConfig: initialData?.scheduleConfig,
            encryptionConfig: initialData?.encryptionConfig || {
                enabled: false,
                type: 'PGP'
            },
            notificationConfig: initialData?.notificationConfig || {
                notifyOnSuccess: false,
                notifyOnFailure: true,
                notificationEmails: [],
                retryConfig: {
                    maxAttempts: 3,
                    delayMinutes: 15
                }
            }
        }
    });

    // Reset form and states when dialog opens/closes or initialData changes
    React.useEffect(() => {
        if (open) {
            form.reset({
                name: initialData?.name || '',
                layoutId: initialData?.layoutId || '',
                format: initialData?.format || 'CSV',
                sftpConfig: initialData?.sftpConfig,
                scheduleConfig: initialData?.scheduleConfig,
                encryptionConfig: initialData?.encryptionConfig || {
                    enabled: false,
                    type: 'PGP'
                },
                notificationConfig: initialData?.notificationConfig
            });
            setShowSftp(!!initialData?.sftpConfig);
            setShowSchedule(!!initialData?.scheduleConfig);
            setShowEncryption(!!initialData?.encryptionConfig?.enabled);
            setShowNotifications(!!initialData?.notificationConfig);
            setActiveTab('basic');
        }
    }, [open, initialData, form.reset]);

    // Handle form submission
    const handleSubmit = (data: FormSchema) => {
        const fileData: FileFormValues = {
            ...data,
            sftpConfig: showSftp ? data.sftpConfig : undefined,
            scheduleConfig: showSchedule ? data.scheduleConfig : undefined,
            encryptionConfig: showEncryption ? {
                ...data.encryptionConfig,
                enabled: true,
                type: 'PGP'
            } : undefined,
            notificationConfig: showNotifications ? data.notificationConfig : undefined
        };
        onSubmit(fileData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit File Configuration' : 'Create New File'}
                    </DialogTitle>
                    <DialogDescription>
                        Configure your file format, delivery, schedule, and notification settings.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="px-6">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <TabsContent value="basic" className="mt-0">
                                    <BasicConfigTab 
                                        form={form} 
                                    />
                                </TabsContent>

                                <TabsContent value="delivery" className="mt-0">
                                    <DeliveryConfigTab
                                        form={form}
                                        showSftp={showSftp}
                                        setShowSftp={setShowSftp}
                                        showEncryption={showEncryption}
                                        setShowEncryption={setShowEncryption}
                                    />
                                </TabsContent>

                                <TabsContent value="schedule" className="mt-0">
                                    <ScheduleConfigTab
                                        form={form}
                                        showSchedule={showSchedule}
                                        setShowSchedule={setShowSchedule}
                                    />
                                </TabsContent>

                                <TabsContent value="notifications" className="mt-0">
                                    <NotificationsTab
                                        form={form}
                                        showNotifications={showNotifications}
                                        setShowNotifications={setShowNotifications}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>

                        <DialogFooter className="px-6 py-4 border-t mt-auto">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                disabled={!form.formState.isValid}
                            >
                                {initialData ? 'Update File' : 'Create File'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}