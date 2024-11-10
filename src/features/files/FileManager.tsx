// src/features/files/FileManager.tsx

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { 
  FileConfiguration, 
  FileFormValues, 
  FileStatus 
} from './types';
import { mockFiles } from './mockData';
import { mockLayouts } from '../layouts/mockData';
import { FileFormDialog, FileList, FileStats } from './components';
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

export default function FileManager() {
  // State
  const [files, setFiles] = React.useState<FileConfiguration[]>(mockFiles);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<FileConfiguration | null>(null);
  const [fileToDelete, setFileToDelete] = React.useState<FileConfiguration | null>(null);
  const { toast } = useToast();

  // Create or update file
  const handleCreateFile = (values: FileFormValues) => {
    if (selectedFile) {
      // Update existing file
      setFiles(prev =>
        prev.map(file =>
          file.id === selectedFile.id
            ? {
                ...selectedFile,
                ...values,
                status: selectedFile.status,
                updatedAt: new Date().toISOString()
              }
            : file
        )
      );
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

      setFiles(prev => [...prev, newFile]);
      toast({
        title: "File Created",
        description: "New file configuration has been created successfully."
      });
    }
    handleDialogClose();
  };

  // Status change handler
  const handleStatusChange = (fileId: string, newStatus: FileStatus) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (!canChangeStatus(file, newStatus)) {
      return;
    }

    setFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { 
              ...file, 
              status: newStatus, 
              updatedAt: new Date().toISOString() 
            }
          : file
      )
    );

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

  // Validation rules for status changes
  const canChangeStatus = (file: FileConfiguration, newStatus: FileStatus): boolean => {
    const associatedLayout = mockLayouts.find(layout => layout.id === file.layoutId);
    
    if (!associatedLayout) {
      toast({
        title: "Invalid Layout",
        description: "The file is not associated with a valid layout.",
        variant: "destructive"
      });
      return false;
    }

    if (newStatus === 'active') {
      // Check if layout is active
      if (associatedLayout.status !== 'active') {
        toast({
          title: "Layout Not Active",
          description: "The associated layout must be active before activating the file.",
          variant: "destructive"
        });
        return false;
      }

      // Check other required configurations
      const hasRequiredConfig = 
        file.layoutId && 
        (file.sftpConfig || file.scheduleConfig);
      
      if (!hasRequiredConfig) {
        toast({
          title: "Missing Configuration",
          description: "File requires SFTP or schedule configuration to be activated.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  // Handle layout status changes (subscribe to layout changes if possible)
  React.useEffect(() => {
    const updateFileStatusesBasedOnLayouts = () => {
      setFiles(prevFiles => 
        prevFiles.map(file => {
          const layout = mockLayouts.find(l => l.id === file.layoutId);
          if (layout && file.status === 'active' && layout.status !== 'active') {
            // If layout becomes inactive, move file to draft
            return {
              ...file,
              status: 'draft',
              updatedAt: new Date().toISOString()
            };
          }
          return file;
        })
      );
    };

    // Call this when component mounts and when layouts change
    updateFileStatusesBasedOnLayouts();
  }, [/* Add layout changes dependency here if available */]);

  // Edit handler
  const handleEditFile = (file: FileConfiguration) => {
    setSelectedFile(file);
    setIsCreateDialogOpen(true);
  };

  // Delete handlers
  const handleDeleteInitiate = (file: FileConfiguration) => {
    setFileToDelete(file);
  };

  const handleDeleteConfirm = () => {
    if (!fileToDelete) return;

    if (fileToDelete.status === 'active') {
      toast({
        title: "Cannot Delete Active File",
        description: "Please deactivate the file before deleting.",
        variant: "destructive"
      });
      return;
    }

    setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
    toast({
      title: "File Deleted",
      description: "File configuration has been deleted successfully.",
      variant: "destructive"
    });
    setFileToDelete(null);
  };

  // Dialog close handler
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedFile(null);
  };

  // Status change handler with validation
  const handleValidatedStatusChange = (fileId: string, newStatus: FileStatus) => {
    const file = files.find(f => f.id === fileId);
    if (file && canChangeStatus(file, newStatus)) {
      handleStatusChange(fileId, newStatus);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">File Manager</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
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
        onStatusChange={handleValidatedStatusChange}
      />

      <FileFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateFile}
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