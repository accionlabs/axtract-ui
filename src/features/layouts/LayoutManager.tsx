// src/features/layouts/LayoutManager.tsx

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout, LayoutFormValues, LayoutStatus } from './types';
import { useToast } from "@/hooks/use-toast";
import { useAppState } from '@/context/AppStateContext';
import LayoutStats from './components/LayoutStats';
import LayoutList from './components/LayoutList';
import LayoutFormDialog from './components/LayoutFormDialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

export default function LayoutManager() {
  // Get state and actions from context
  const { 
    state: { layouts }, 
    addLayout, 
    updateLayout, 
    deleteLayout,
    updateLayoutStatus 
  } = useAppState();

  // Local UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedLayout, setSelectedLayout] = React.useState<Layout | null>(null);
  const [layoutToDelete, setLayoutToDelete] = React.useState<Layout | null>(null);
  const { toast } = useToast();

  // Create new layout
  const handleCreateLayout = (values: LayoutFormValues) => {
    const newLayout: Layout = {
      id: `layout-${Date.now()}`,
      name: values.name,
      description: values.description,
      type: values.type,
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString(),
      fields: values.fields.map((field, index) => ({
        ...field,
        id: field.id || `field-${Date.now()}-${index}`,
        order: index,
        customProperties: field.customProperties || {}
      }))
    };

    addLayout(newLayout);
    handleDialogClose();
    toast({
      title: "Layout Created",
      description: "New layout has been created successfully."
    });
  };

  // Update existing layout
  const handleUpdateLayout = (values: LayoutFormValues) => {
    if (!selectedLayout) return;

    const updatedLayout: Layout = {
      ...selectedLayout,
      name: values.name,
      description: values.description,
      type: values.type,
      lastModified: new Date().toISOString(),
      fields: values.fields.map((field, index) => ({
        ...field,
        id: field.id || `field-${Date.now()}-${index}`,
        order: index,
        customProperties: field.customProperties || {}
      }))
    };

    updateLayout(updatedLayout);
    handleDialogClose();
    toast({
      title: "Layout Updated",
      description: "Layout has been updated successfully."
    });
  };

  // Handle layout status changes with validation
  const handleStatusChange = (layoutId: string, newStatus: LayoutStatus) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;

    // Validate status change
    const canChangeStatus = () => {
      if (newStatus === 'active') {
        // Check if layout has required fields
        const hasRequiredFields = layout.fields.some(field => field.required);
        if (!hasRequiredFields) {
          toast({
            title: "Cannot Activate",
            description: "Layout must have at least one required field.",
            variant: "destructive"
          });
          return false;
        }

        // Check if layout has minimum fields
        if (layout.fields.length === 0) {
          toast({
            title: "Cannot Activate",
            description: "Layout must have at least one field.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Check for dependent files if deactivating
      if (layout.status === 'active' && newStatus !== 'active') {
        // This check would ideally come from the context
        const hasActiveFiles = false; // You would check this using the files state
        if (hasActiveFiles) {
          toast({
            title: "Cannot Deactivate",
            description: "Layout has active files. Deactivate files first.",
            variant: "destructive"
          });
          return false;
        }
      }

      return true;
    };

    if (!canChangeStatus()) return;

    // Update status if validation passes
    updateLayoutStatus(layoutId, newStatus);
    toast({
      title: "Status Updated",
      description: `Layout status changed to ${newStatus}.`
    });
  };

  // Edit layout
  const handleEditLayout = (layout: Layout) => {
    if (layout.status === 'active') {
      toast({
        title: "Cannot Edit",
        description: "Active layouts cannot be edited. Deactivate first.",
        variant: "destructive"
      });
      return;
    }
    setSelectedLayout(layout);
    setIsCreateDialogOpen(true);
  };

  // Initiate layout deletion
  const handleDeleteInitiate = (layout: Layout) => {
    if (layout.status === 'active') {
      toast({
        title: "Cannot Delete",
        description: "Active layouts cannot be deleted. Deactivate first.",
        variant: "destructive"
      });
      return;
    }
    setLayoutToDelete(layout);
  };

  // Confirm and execute layout deletion
  const handleDeleteConfirm = () => {
    if (!layoutToDelete) return;

    // Check for dependencies before deletion
    const hasFiles = false; // You would check this using the files state
    if (hasFiles) {
      toast({
        title: "Cannot Delete",
        description: "Layout has associated files. Remove files first.",
        variant: "destructive"
      });
      return;
    }

    deleteLayout(layoutToDelete.id);
    setLayoutToDelete(null);
    toast({
      title: "Layout Deleted",
      description: "Layout has been permanently deleted.",
      variant: "destructive"
    });
  };

  // Clean up on dialog close
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedLayout(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Layout Manager</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Layout
        </Button>
      </div>

      <LayoutStats layouts={layouts} />

      <LayoutList
        layouts={layouts}
        onEdit={handleEditLayout}
        onDelete={handleDeleteInitiate}
        onStatusChange={handleStatusChange}
      />

      <LayoutFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={selectedLayout ? handleUpdateLayout : handleCreateLayout}
        initialData={selectedLayout}
      />

      <AlertDialog 
        open={!!layoutToDelete} 
        onOpenChange={(open) => !open && setLayoutToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this layout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}