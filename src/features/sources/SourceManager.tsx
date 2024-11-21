import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSourceConfiguration from "./components/DataSourceConfiguration";
import DataSourceList from "./components/DataSourceList";
import DataSourceStats from "./components/DataSourceStats";
import QueryManager from "./components/QueryManager";
import { DataSource } from "./types";
import { mockDataSources } from "./mockData/mockData";
import { useToast } from "@/hooks/use-toast";
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

type DataSourceInput = Omit<DataSource, "id" | "createdAt" | "updatedAt">;

export default function SourceManager() {
  // State
  const [sources, setSources] = React.useState<DataSource[]>(mockDataSources);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<DataSource | null>(
    null
  );
  const [activeTab, setActiveTab] = React.useState("sources");
  const [sourceToDelete, setSourceToDelete] = React.useState<DataSource | null>(
    null
  );
  const { toast } = useToast();

  // Source management handlers
  const handleCreateSource = (source: DataSourceInput) => {
    const newSource: DataSource = {
      ...source,
      id: `ds-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSources((prev) => [...prev, newSource]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Source Created",
      description: "New data source has been created successfully.",
    });
  };

  const handleEditSource = (source: DataSource) => {
    setSelectedSource(source);
    setIsCreateDialogOpen(true);
  };

  const handleUpdateSource = (sourceInput: DataSourceInput) => {
    if (!selectedSource) return;

    const updatedSource: DataSource = {
      ...sourceInput,
      id: selectedSource.id,
      createdAt: selectedSource.createdAt,
      updatedAt: new Date().toISOString(),
    };

    setSources((prev) =>
      prev.map((source) =>
        source.id === selectedSource.id ? updatedSource : source
      )
    );
    setIsCreateDialogOpen(false);
    setSelectedSource(null);
    toast({
      title: "Source Updated",
      description: "Data source has been updated successfully.",
    });
  };

  const handleDeleteInitiate = (source: DataSource) => {
    setSourceToDelete(source);
  };

  const handleDeleteConfirm = () => {
    if (!sourceToDelete) return;

    if (sourceToDelete.status === "active") {
      toast({
        title: "Cannot Delete Active Source",
        description: "Please deactivate the source before deleting.",
        variant: "destructive",
      });
      return;
    }

    setSources((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
    setSourceToDelete(null);
    toast({
      title: "Source Deleted",
      description: "Data source has been deleted successfully.",
    });
  };

  const handleTestConnection = async (sourceId: string) => {
    const source = sources.find((s) => s.id === sourceId);
    if (!source) return;

    toast({
      title: "Testing Connection",
      description: `Testing connection to ${source.name}...`,
    });

    try {
      // Show loading state
      setSources((prev) =>
        prev.map((s) =>
          s.id === sourceId ? { ...s, status: "configuring" } : s
        )
      );

      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const success = Math.random() > 0.3;
      setSources((prev) =>
        prev.map((s) =>
          s.id === sourceId
            ? {
                ...s,
                status: success ? "active" : "error",
                lastTestAt: new Date().toISOString(),
              }
            : s
        )
      );

      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success
          ? `Successfully connected to ${source.name}`
          : `Failed to connect to ${source.name}. Please check your configuration.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, status: "error" } : s))
      );
      toast({
        title: "Connection Failed",
        description:
          "An unexpected error occurred while testing the connection.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedSource(null);
  };

  return (
    <div className="space-y-6">
      <div className="px-6 py-4 border-b">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Source Manager</h1>
            <p className="text-sm text-muted-foreground">
              Configure and manage data sources for extracts
            </p>
          </div>
          {activeTab === "sources" && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              New Source
            </Button>
          )}
        </div>

        {/* Main Tabs */}
        <div className="mt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="queries">Queries</TabsTrigger>
            </TabsList>

            {/* Tab Content - moved inside Tabs component */}
            <div>
              <DataSourceStats sources={sources} />

              <TabsContent value="sources" className="mt-6">
                <DataSourceList
                  sources={sources}
                  onEdit={handleEditSource}
                  onDelete={handleDeleteInitiate}
                  onTest={handleTestConnection}
                />
              </TabsContent>

              <TabsContent value="queries" className="mt-6">
                <QueryManager
                  sources={sources.filter((s) => s.status === "active")}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Source Configuration Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSource ? "Edit Data Source" : "Create New Data Source"}
            </DialogTitle>
            <DialogDescription>
              Configure your data source connection details and test the
              connection.
            </DialogDescription>
          </DialogHeader>

          <DataSourceConfiguration
            initialData={selectedSource}
            onSubmit={selectedSource ? handleUpdateSource : handleCreateSource}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!sourceToDelete}
        onOpenChange={(open) => !open && setSourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this data source? This action
              cannot be undone.
              {sourceToDelete?.status === "active" && (
                <p className="mt-2 text-red-500">
                  Warning: This source is currently active. Please deactivate it
                  before deleting.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={sourceToDelete?.status === "active"}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
