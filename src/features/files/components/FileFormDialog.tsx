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

const sftpConfigSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().min(1).max(65535),
    username: z.string().min(1, 'Username is required'),
    path: z.string().min(1, 'Path is required'),
    knownHostKey: z.string().optional()
});

const apiConfigSchema = z.object({
    method: z.enum(['POST', 'PUT', 'PATCH']),
    url: z.string().url('Must be a valid URL'),
    headers: z.string().transform((str) => {
        try {
            return JSON.parse(str);
        } catch {
            return {};
        }
    }).optional(),
    validateSsl: z.boolean(),
    timeout: z.number().min(1).max(300).optional(), // seconds
    retryStrategy: z.object({
        maxRetries: z.number().min(0).max(5),
        backoffMultiplier: z.number().min(1).max(3)
    }).optional()
});

const databaseConfigSchema = z.object({
    type: z.enum(['postgresql', 'mysql', 'sqlserver', 'oracle']),
    host: z.string().min(1, 'Host is required'),
    port: z.number().min(1).max(65535),
    name: z.string().min(1, 'Database name is required'),
    username: z.string().min(1, 'Username is required'),
    schema: z.string().min(1, 'Schema is required'),
    table: z.string().min(1, 'Table name is required'),
    writeMode: z.enum(['insert', 'upsert', 'replace']),
    batchSize: z.number().min(1).max(10000).optional(),
    connectionTimeout: z.number().min(1).max(300).optional() // seconds
});

const deliveryConfigSchema = z.object({
    type: z.enum(['sftp', 'api', 'database']),
    sftp: sftpConfigSchema.optional(),
    api: apiConfigSchema.optional(),
    database: databaseConfigSchema.optional()
}).refine(
    (data) => {
        // Ensure the corresponding config is present based on type
        switch (data.type) {
            case 'sftp':
                return !!data.sftp;
            case 'api':
                return !!data.api;
            case 'database':
                return !!data.database;
            default:
                return false;
        }
    },
    {
        message: "Configuration is required for the selected delivery method"
    }
);

const fileFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    layoutId: z.string().min(1, 'Layout is required'),
    format: z.enum(['CSV', 'TSV', 'JSON', 'FIXED']),
    deliveryConfig: deliveryConfigSchema.optional(),
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
    const [showSchedule, setShowSchedule] = React.useState(false);
    const [showEncryption, setShowEncryption] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showDelivery, setShowDelivery] = React.useState(false);
    const [, setDeliveryType] = React.useState('SFTP')

    // Initialize form with react-hook-form
    const form = useForm<FormSchema>({
        resolver: zodResolver(fileFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            layoutId: initialData?.layoutId || '',
            format: initialData?.format || 'CSV',
            // New delivery configuration structure
            deliveryConfig: initialData?.deliveryConfig || {
                type: 'sftp',
                sftp: {
                    host: '',
                    port: 22,
                    username: '',
                    path: '',
                    knownHostKey: ''
                }
            },
            // Schedule configuration
            scheduleConfig: initialData?.scheduleConfig || {
                frequency: 'daily',
                time: '00:00',
                timezone: 'UTC',
                daysOfWeek: undefined,
                daysOfMonth: undefined
            },
            // Encryption configuration
            encryptionConfig: initialData?.encryptionConfig || {
                enabled: false,
                type: 'PGP',
                publicKey: undefined
            },
            // Notification configuration
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

    // Add watch effect to handle delivery type changes
    React.useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'deliveryConfig.type') {
                const deliveryType = value.deliveryConfig?.type;

                // Reset other delivery configs when type changes
                if (deliveryType === 'sftp') {
                    form.setValue('deliveryConfig.api', undefined);
                    form.setValue('deliveryConfig.database', undefined);
                    form.setValue('deliveryConfig.sftp', {
                        host: '',
                        port: 22,
                        username: '',
                        path: '',
                        knownHostKey: ''
                    });
                } else if (deliveryType === 'api') {
                    form.setValue('deliveryConfig.sftp', undefined);
                    form.setValue('deliveryConfig.database', undefined);
                    form.setValue('deliveryConfig.api', {
                        method: 'POST',
                        url: '',
                        validateSsl: true,
                        timeout: 60,
                        retryStrategy: {
                            maxRetries: 3,
                            backoffMultiplier: 2
                        }
                    });
                } else if (deliveryType === 'database') {
                    form.setValue('deliveryConfig.sftp', undefined);
                    form.setValue('deliveryConfig.api', undefined);
                    form.setValue('deliveryConfig.database', {
                        type: 'postgresql',
                        host: '',
                        port: 5432,
                        name: '',
                        username: '',
                        schema: 'public',
                        table: '',
                        writeMode: 'insert',
                        batchSize: 1000,
                        connectionTimeout: 30
                    });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    // Reset form and states when dialog opens/closes or initialData changes
    React.useEffect(() => {
        if (open) {
            form.reset({
                name: initialData?.name || '',
                layoutId: initialData?.layoutId || '',
                format: initialData?.format || 'CSV',
                deliveryConfig: initialData?.deliveryConfig || {
                    type: 'sftp',
                    sftp: {
                        host: '',
                        port: 22,
                        username: '',
                        path: '',
                        knownHostKey: ''
                    }
                },
                scheduleConfig: initialData?.scheduleConfig || {
                    frequency: 'daily',
                    time: '00:00',
                    timezone: 'UTC',
                    daysOfWeek: undefined,
                    daysOfMonth: undefined
                },
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
            });

            // Set show states based on initial data
            setShowDelivery(!!initialData?.deliveryConfig);
            setShowSchedule(!!initialData?.scheduleConfig);
            setShowEncryption(!!initialData?.encryptionConfig?.enabled);
            setShowNotifications(!!initialData?.notificationConfig);
            setActiveTab('basic');

            // If editing, ensure delivery type is properly set
            if (initialData?.deliveryConfig) {
                setDeliveryType(initialData.deliveryConfig.type);
            }
        }
    }, [open, initialData, form.reset]);

    // Handle form submission
    const handleSubmit = (data: FormSchema) => {
        const fileData: FileFormValues = {
            ...data,
            deliveryConfig: showDelivery ? {
                type: data.deliveryConfig?.type || 'sftp',
                // Only include the config for the selected delivery type
                sftp: data.deliveryConfig?.type === 'sftp' ? data.deliveryConfig.sftp : undefined,
                api: data.deliveryConfig?.type === 'api' ? data.deliveryConfig.api : undefined,
                database: data.deliveryConfig?.type === 'database' ? data.deliveryConfig.database : undefined
            } : undefined,
            scheduleConfig: showSchedule ? data.scheduleConfig : undefined,
            encryptionConfig: showEncryption ? {
                ...data.encryptionConfig,
                enabled: true,
                type: 'PGP'
            } : undefined,
            notificationConfig: showNotifications ? data.notificationConfig : undefined
        };

        // Clean up undefined configurations
        if (fileData.deliveryConfig) {
            if (!fileData.deliveryConfig.sftp && !fileData.deliveryConfig.api && !fileData.deliveryConfig.database) {
                fileData.deliveryConfig = undefined;
            }
        }

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
                                        showDelivery={showDelivery}
                                        setShowDelivery={setShowDelivery}
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