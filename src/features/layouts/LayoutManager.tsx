import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout, LayoutFormValues, LayoutField, LayoutFormField } from './types';
import { mockLayouts } from './mockData';
import { useToast } from "@/hooks/use-toast";
import LayoutStats from './components/LayoutStats';
import LayoutList from './components/LayoutList';
import LayoutFormDialog from './components/LayoutFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Helper function to convert form field to layout field
const convertToLayoutField = (field: LayoutFormField, index: number): LayoutField => ({
  id: field.id || `field-${Date.now()}-${index}`,
  name: field.name,
  type: field.type,
  description: field.description,
  required: field.required,
  category: field.category || 'General',
  validation: field.validation || {},
  order: index,
  customProperties: field.customProperties || {}
});

export default function LayoutManager() {
  // State management
  const [layouts, setLayouts] = React.useState<Layout[]>(mockLayouts);
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
      fields: values.fields.map(convertToLayoutField)
    };

    setLayouts(prev => [...prev, newLayout]);
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
      fields: values.fields.map(convertToLayoutField)
    };

    setLayouts(prev => 
      prev.map(layout => 
        layout.id === selectedLayout.id ? updatedLayout : layout
      )
    );
    handleDialogClose();
    toast({
      title: "Layout Updated",
      description: "Layout has been updated successfully."
    });
  };

  // Handle layout status changes
  const handleStatusChange = (layoutId: string, newStatus: 'draft' | 'pending' | 'active') => {
    setLayouts(prev =>
      prev.map(layout =>
        layout.id === layoutId
          ? { ...layout, status: newStatus, lastModified: new Date().toISOString() }
          : layout
      )
    );
    toast({
      title: "Status Updated",
      description: `Layout status changed to ${newStatus}.`
    });
  };

  // Edit layout
  const handleEditLayout = (layout: Layout) => {
    setSelectedLayout(layout);
    setIsCreateDialogOpen(true);
  };

  // Initiate layout deletion
  const handleDeleteInitiate = (layout: Layout) => {
    setLayoutToDelete(layout);
  };

  // Confirm and execute layout deletion
  const handleDeleteConfirm = () => {
    if (!layoutToDelete) return;

    setLayouts(prev => prev.filter(l => l.id !== layoutToDelete.id));
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

      <AlertDialog open={!!layoutToDelete} onOpenChange={(open) => !open && setLayoutToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this layout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}