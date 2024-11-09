// src/features/layouts/LayoutManager.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout, LayoutFormValues, LayoutType, LayoutField } from './types';
import { mockLayouts } from './mockData';
import { useToast } from "@/hooks/use-toast";
import LayoutStats from './components/LayoutStats';
import LayoutList from './components/LayoutList';
import LayoutFormDialog from './components/LayoutFormDialog';

export default function LayoutManager() {
  const [layouts, setLayouts] = React.useState<Layout[]>(mockLayouts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedLayout, setSelectedLayout] = React.useState<Layout | null>(null);
  const { toast } = useToast();

  const handleCreateLayout = (values: LayoutFormValues) => {
    const newLayout: Layout = {
      id: `layout-${Date.now()}`,
      name: values.name,
      description: values.description,
      type: values.type,
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString(),
      fields: values.fields.map((field, index): LayoutField => ({
        id: `field-${Date.now()}-${index}`,
        name: field.name,
        type: field.type,
        description: field.description,
        required: field.required,
        category: field.category || 'General',
        validation: field.validation,
        order: index,
        customProperties: {}
      }))
    };

    setLayouts(prev => [...prev, newLayout]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Layout Created",
      description: "New layout has been created successfully."
    });
  };

  const handleUpdateLayout = (values: LayoutFormValues) => {
    if (!selectedLayout) return;

    const updatedLayout: Layout = {
      ...selectedLayout,
      name: values.name,
      description: values.description,
      type: values.type,
      lastModified: new Date().toISOString(),
      fields: values.fields.map((field, index): LayoutField => ({
        id: selectedLayout.fields[index]?.id || `field-${Date.now()}-${index}`,
        name: field.name,
        type: field.type,
        description: field.description,
        required: field.required,
        category: field.category || 'General',
        validation: field.validation,
        order: index,
        customProperties: selectedLayout.fields[index]?.customProperties || {}
      }))
    };

    setLayouts(prev => 
      prev.map(layout => 
        layout.id === selectedLayout.id ? updatedLayout : layout
      )
    );
    setIsCreateDialogOpen(false);
    setSelectedLayout(null);
    toast({
      title: "Layout Updated",
      description: "Layout has been updated successfully."
    });
  };

  const handleEditLayout = (layout: Layout) => {
    setSelectedLayout(layout);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteLayout = (layout: Layout) => {
    setLayouts(prev => prev.filter(l => l.id !== layout.id));
    toast({
      title: "Layout Deleted",
      description: "Layout has been deleted successfully.",
      variant: "destructive"
    });
  };

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
        onDelete={handleDeleteLayout}
      />

      <LayoutFormDialog
        open={isCreateDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={selectedLayout ? handleUpdateLayout : handleCreateLayout}
        initialData={selectedLayout}
      />
    </div>
  );
}