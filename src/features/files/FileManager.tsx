// src/features/fileManager/FileManager.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileConfiguration } from './types';
import { mockFiles, mockLayouts } from './mockData';
import { FileStats, FileList, FileCreationForm } from './components';
import { useToast } from "@/hooks/use-toast";

export default function FileManager() {
  const [files, setFiles] = React.useState<FileConfiguration[]>(mockFiles);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<FileConfiguration | null>(null);
  const { toast } = useToast();

  const handleCreateFile = (data: Partial<FileConfiguration>) => {
    const newFile: FileConfiguration = {
      ...data,
      id: `file-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FileConfiguration;

    setFiles(prev => [...prev, newFile]);
    setIsCreateDialogOpen(false);
    toast({
      title: "File Created",
      description: "New file configuration has been created successfully."
    });
  };

  const handleEditFile = (file: FileConfiguration) => {
    selectedFile;
    setSelectedFile(file);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteFile = (file: FileConfiguration) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    toast({
      title: "File Deleted",
      description: "File configuration has been deleted successfully.",
      variant: "destructive"
    });
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedFile(null);
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
          New File Configuration
        </Button>
      </div>

      <FileStats files={files} />

      <FileList
        files={files}
        onEdit={handleEditFile}
        onDelete={handleDeleteFile}
      />

      {isCreateDialogOpen && (
        <FileCreationForm
          onSubmit={handleCreateFile}
          onCancel={handleDialogClose}
          availableLayouts={mockLayouts}
        />
      )}
    </div>
  );
}