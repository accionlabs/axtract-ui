// src/features/files/FileManager.tsx

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useAppState } from '@/context/AppStateContext';
import { FileConfiguration, FileStatus } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import FileStats from './components/FileStats';
import FileList from './components/FileList';
import FileFormDialog from './components/FileFormDialog';

export default function FileManager() {
  // Get state and actions from AppState context
  const {
    state: { files, layouts },
    addFile,
    updateFile,
    deleteFile,
    updateFileStatus
  } = useAppState();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<FileConfiguration | null>(null);
  const [fileToDelete, setFileToDelete] = React.useState<FileConfiguration | null>(null);
  const { toast } = useToast();

  // File creation/update handler
  const handleSubmit = (values: Omit<FileConfiguration, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (selectedFile) {
      // Update existing file
      const updatedFile: FileConfiguration = {
        ...selectedFile,
        ...values,
        updatedAt: new Date().toISOString()
      };
      updateFile(updatedFile);
      toast({
        title: "File Updated",
        description: "File configuration has been updated successfully."
      });
    } else {
      // Create new file
      const newFile: FileConfiguration = {
        id: `file-${Date.now()}`,
        ...values,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addFile(newFile);
      toast({
        title: "File Created",
        description: "New file configuration has been created successfully."
      });
    }
    handleDialogClose();
  };

  // Validate status change
  const canChangeStatus = (file: FileConfiguration, newStatus: FileStatus): boolean => {
    const layout = layouts.find(l => l.id === file.layoutId);

    if (!layout) {
      toast({
        title: "Invalid Layout",
        description: "The file is not associated with a valid layout.",
        variant: "destructive"
      });
      return false;
    }

    if (newStatus === 'active') {
      // Check layout status
      if (layout.status !== 'active') {
        toast({
          title: "Layout Not Active",
          description: "The associated layout must be active before activating the file.",
          variant: "destructive"
        });
        return false;
      }

      // Check delivery configuration
      if (!file.deliveryConfig) {
        toast({
          title: "Missing Delivery Configuration",
          description: "File requires a delivery method (SFTP, API, or Database) to be activated.",
          variant: "destructive"
        });
        return false;
      }

      // Validate configuration based on delivery type
      const { deliveryConfig } = file;
      switch (deliveryConfig.type) {
        case 'sftp':
          if (!deliveryConfig.sftp || !deliveryConfig.sftp.host || !deliveryConfig.sftp.path) {
            toast({
              title: "Invalid SFTP Configuration",
              description: "SFTP configuration requires at least a host and path.",
              variant: "destructive"
            });
            return false;
          }
          break;

        case 'api':
          if (!deliveryConfig.api || !deliveryConfig.api.url) {
            toast({
              title: "Invalid API Configuration",
              description: "API configuration requires at least an endpoint URL.",
              variant: "destructive"
            });
            return false;
          }
          break;

        case 'database':
          if (!deliveryConfig.database ||
            !deliveryConfig.database.host ||
            !deliveryConfig.database.name ||
            !deliveryConfig.database.table) {
            toast({
              title: "Invalid Database Configuration",
              description: "Database configuration requires host, database name, and table.",
              variant: "destructive"
            });
            return false;
          }
          break;

        default:
          toast({
            title: "Invalid Delivery Type",
            description: "Selected delivery method is not supported.",
            variant: "destructive"
          });
          return false;
      }

      // Check for schedule configuration if required
      if (file.scheduleConfig) {
        if (!file.scheduleConfig.frequency || !file.scheduleConfig.time) {
          toast({
            title: "Invalid Schedule Configuration",
            description: "Schedule configuration requires frequency and time to be set.",
            variant: "destructive"
          });
          return false;
        }

        // Validate frequency-specific settings
        switch (file.scheduleConfig.frequency) {
          case 'weekly':
            if (!file.scheduleConfig.daysOfWeek?.length) {
              toast({
                title: "Invalid Schedule Configuration",
                description: "Weekly schedule requires at least one day of the week to be selected.",
                variant: "destructive"
              });
              return false;
            }
            break;

          case 'monthly':
            if (!file.scheduleConfig.daysOfMonth?.length) {
              toast({
                title: "Invalid Schedule Configuration",
                description: "Monthly schedule requires at least one day of the month to be selected.",
                variant: "destructive"
              });
              return false;
            }
            break;
        }
      }

      // Check encryption if enabled
      if (file.encryptionConfig?.enabled && !file.encryptionConfig.publicKey) {
        toast({
          title: "Invalid Encryption Configuration",
          description: "PGP encryption requires a public key.",
          variant: "destructive"
        });
        return false;
      }

      // Check notification configuration if present
      if (file.notificationConfig) {
        if ((file.notificationConfig.notifyOnSuccess || file.notificationConfig.notifyOnFailure) &&
          !file.notificationConfig.notificationEmails?.length) {
          toast({
            title: "Invalid Notification Configuration",
            description: "Notifications require at least one email address.",
            variant: "destructive"
          });
          return false;
        }
      }
    }

    return true;
  };

  // Status change handler
  const handleStatusChange = (fileId: string, newStatus: FileStatus) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !canChangeStatus(file, newStatus)) return;

    updateFileStatus(fileId, newStatus);

    const statusMessages = {
      draft: "File returned to draft",
      active: "File activated successfully",
      inactive: "File deactivated"
    };

    toast({
      title: "Status Updated",
      description: statusMessages[newStatus]
    });
  };

  // Edit handler
  const handleEditFile = (file: FileConfiguration) => {
    setSelectedFile(file);
    setIsCreateDialogOpen(true);
  };

  // Delete handlers
  const handleDeleteInitiate = (file: FileConfiguration) => {
    if (file.status === 'active') {
      toast({
        title: "Cannot Delete Active File",
        description: "Please deactivate the file before deleting.",
        variant: "destructive"
      });
      return;
    }
    setFileToDelete(file);
  };

  const handleDeleteConfirm = () => {
    if (!fileToDelete) return;
    deleteFile(fileToDelete.id);
    toast({
      title: "File Deleted",
      description: "File configuration has been deleted successfully."
    });
    setFileToDelete(null);
  };

  // Dialog close handler
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold  file-manager-header">File Manager</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 create-file-button"
        >
          <Plus size={16} />
          New File
        </Button>
      </div>

      <FileStats files={files} />

      <FileList
        files={files}
        onEdit={handleEditFile}
        onDelete={handleDeleteInitiate}
        onStatusChange={handleStatusChange}
      />

      <FileFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleSubmit}
        initialData={selectedFile}
      />

      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file configuration? This action cannot be undone.
              {fileToDelete?.status === 'active' && (
                <p className="mt-2 text-red-500">
                  Warning: This file is currently active. Please deactivate it before deleting.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={fileToDelete?.status === 'active'}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}