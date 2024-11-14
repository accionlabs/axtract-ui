// src/features/layouts/LayoutManager.tsx

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout, LayoutFormValues, LayoutStatus, LayoutField } from './types';
import { useToast } from "@/hooks/use-toast";
import { useAppState } from '@/context/AppStateContext';
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

import LayoutStats from './components/LayoutStats';
import LayoutList from './components/LayoutList';
import LayoutFormDialog from './components/LayoutFormDialog';

import { 
  getFieldsByLayoutType,
  formFieldToStandardField,
  convertToLayoutField,
  isValidCategory
} from './fieldConfigurations';

export default function LayoutManager() {
  const { 
    state: { layouts, files }, 
    addLayout, 
    updateLayout, 
    deleteLayout,
    updateLayoutStatus 
  } = useAppState();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedLayout, setSelectedLayout] = React.useState<Layout | null>(null);
  const [layoutToDelete, setLayoutToDelete] = React.useState<Layout | null>(null);
  const { toast } = useToast();

  // Field processing
  const processFormField = (field: LayoutFormValues['fields'][0], index: number): LayoutField => {
    const standardField = formFieldToStandardField(field);
    return convertToLayoutField(standardField, index);
  };

  // Field validation
  const validateFieldConfigurations = (layout: Layout): boolean => {
    if (layout.fields.length === 0) {
      toast({
        title: "Invalid Configuration",
        description: "Layout must have at least one field.",
        variant: "destructive"
      });
      return false;
    }

    const hasValidFields = layout.fields.every(field => {
      if (!field.name || field.name.trim().length < 2) {
        toast({
          title: "Invalid Field Name",
          description: `Field names must be at least 2 characters: ${field.name}`,
          variant: "destructive"
        });
        return false;
      }

      if (!field.description || field.description.trim().length < 10) {
        toast({
          title: "Invalid Description",
          description: `Field "${field.name}" must have a meaningful description (min 10 chars)`,
          variant: "destructive"
        });
        return false;
      }

      if (field.category !== undefined && !isValidCategory(field.category, layout.type)) {
        toast({
          title: "Invalid Category",
          description: `Category "${field.category}" is not valid for ${layout.type} layout type`,
          variant: "destructive"
        });
        return false;
      }

      if (field.required && (!field.validation || Object.keys(field.validation).length === 0)) {
        toast({
          title: "Missing Validation",
          description: `Required field "${field.name}" must have validation rules`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    return hasValidFields;
  };

  const validateStatusChange = (layout: Layout, newStatus: LayoutStatus): boolean => {
    if (newStatus === 'active') {
      const hasRequiredFields = layout.fields.some(field => field.required);
      if (!hasRequiredFields) {
        toast({
          title: "Cannot Activate",
          description: "Layout must have at least one required field.",
          variant: "destructive"
        });
        return false;
      }

      if (!validateFieldConfigurations(layout)) {
        return false;
      }
    }

    if (layout.status === 'active' && newStatus !== 'active') {
      const hasActiveFiles = files.some(
        file => file.layoutId === layout.id && file.status === 'active'
      );
      if (hasActiveFiles) {
        toast({
          title: "Cannot Change Status",
          description: "Layout has active files. Deactivate files first.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  // Handlers
  const handleCreateLayout = (values: LayoutFormValues) => {
    const fields = values.fields.map(processFormField);

    const newLayout: Layout = {
      id: `layout-${Date.now()}`,
      name: values.name,
      description: values.description,
      type: values.type,
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString(),
      fields
    };

    if (!validateFieldConfigurations(newLayout)) {
      return;
    }

    addLayout(newLayout);
    handleDialogClose();
    toast({
      title: "Layout Created",
      description: "New layout has been created successfully."
    });
  };

  const handleUpdateLayout = (values: LayoutFormValues) => {
    if (!selectedLayout) return;

    const fields = values.fields.map(processFormField);

    const updatedLayout: Layout = {
      ...selectedLayout,
      name: values.name,
      description: values.description,
      type: values.type,
      lastModified: new Date().toISOString(),
      fields
    };

    if (!validateFieldConfigurations(updatedLayout)) {
      return;
    }

    updateLayout(updatedLayout);
    handleDialogClose();
    toast({
      title: "Layout Updated",
      description: "Layout has been updated successfully."
    });
  };

  const handleStatusChange = (layoutId: string, newStatus: LayoutStatus) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;

    if (!validateStatusChange(layout, newStatus)) return;

    updateLayoutStatus(layoutId, newStatus);
    toast({
      title: "Status Updated",
      description: `Layout status changed to ${newStatus}.`
    });
  };

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

  const handleDeleteInitiate = (layout: Layout) => {
    if (layout.status === 'active') {
      toast({
        title: "Cannot Delete",
        description: "Active layouts cannot be deleted. Deactivate first.",
        variant: "destructive"
      });
      return;
    }

    const hasFiles = files.some(file => file.layoutId === layout.id);
    if (hasFiles) {
      toast({
        title: "Cannot Delete",
        description: "Layout has associated files. Remove files first.",
        variant: "destructive"
      });
      return;
    }

    setLayoutToDelete(layout);
  };

  const handleDeleteConfirm = () => {
    if (!layoutToDelete) return;
    deleteLayout(layoutToDelete.id);
    setLayoutToDelete(null);
    toast({
      title: "Layout Deleted",
      description: "Layout has been permanently deleted."
    });
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedLayout(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1 layout-manager-header">
          <h1 className="text-2xl font-bold">Layout Manager</h1>
          <p className="text-sm text-muted-foreground">
            Configure and manage data extract layouts
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 create-layout-button"
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
        getAvailableFields={getFieldsByLayoutType}
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