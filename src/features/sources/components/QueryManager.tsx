import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DataSource, QueryDefinition, QueryValidation } from "../types";
import {
  Database,
  Plus,
  Play,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import QueryBuilder from "./QueryBuilder";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  mockQueries,
} from "../mockData/queries";
import { getQueryPreview } from "../utils/query";

interface QueryManagerProps {
  sources: DataSource[];
}

export default function QueryManager({ sources }: QueryManagerProps) {
  const [queries, setQueries] = useState<QueryDefinition[]>(mockQueries);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<QueryDefinition | null>(
    null
  );
  const [queryValidation, setQueryValidation] = useState<
    Record<string, QueryValidation>
  >({});

  const handleCreateQuery = () => {
    setSelectedQuery(null);
    setIsBuilderOpen(true);
  };

  const handleEditQuery = (query: QueryDefinition) => {
    setSelectedQuery(query);
    setIsBuilderOpen(true);
  };

  const handleDeleteQuery = (queryId: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== queryId));
  };

  const handleSaveQuery = (query: QueryDefinition) => {
    if (selectedQuery) {
      // Update existing query
      setQueries((prev) =>
        prev.map((q) =>
          q.id === selectedQuery.id
            ? { ...query, updatedAt: new Date().toISOString() }
            : q
        )
      );
    } else {
      // Create new query
      const newQuery = {
        ...query,
        id: `query-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setQueries((prev) => [...prev, newQuery]);
    }
    setIsBuilderOpen(false);
    setSelectedQuery(null);
  };

  const handlePreviewQuery = async (query: QueryDefinition) => {
    try {
      const result = await getQueryPreview(query);
      return result.rows;
    } catch (error) {
      console.error('Preview generation failed:', error);
      throw error;
    }
  };
  
  const handleQueryValidation = (validation: QueryValidation) => {
    // Update validation state
    setQueryValidation((prev) => ({
        ...prev,
        [selectedQuery?.id || 'new']: validation
      }));
  };

  const getQueryStatus = (query: QueryDefinition) => {
    const validation = queryValidation[query.id];
    if (!validation)
      return { label: "draft", color: "bg-gray-100 text-gray-800" };
    if (!validation.isValid)
      return { label: "invalid", color: "bg-red-100 text-red-800" };
    return { label: "valid", color: "bg-green-100 text-green-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Query Manager</CardTitle>
              <CardDescription>
                Create and manage data extraction queries
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateQuery}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Query
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {queries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No queries created yet</p>
              <p className="text-sm">Create your first query to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((query) => {
                  const status = getQueryStatus(query);
                  const validation = queryValidation[query.id];

                  return (
                    <TableRow key={query.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{query.name}</span>
                          {query.description && (
                            <span className="text-sm text-muted-foreground">
                              {query.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {query.sources.map((source, index) => (
                            <Badge key={index} variant="secondary">
                              {sources.find((s) => s.id === source.sourceId)
                                ?.name || source.sourceId}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="font-mono">
                            {query.selectedFields.length} fields
                          </Badge>
                          {query.joins.length > 0 && (
                            <Badge variant="outline" className="font-mono">
                              {query.joins.length} joins
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={status.color}>
                            {status.label}
                          </Badge>
                          {validation && !validation.isValid && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {validation.messages.map((msg, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "text-xs",
                                          msg.severity === "error" &&
                                            "text-red-500",
                                          msg.severity === "warning" &&
                                            "text-yellow-500"
                                        )}
                                      >
                                        {msg.message}
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(query.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuery(query)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewQuery(query)}
                            disabled={!queryValidation[query.id]?.isValid}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuery(query.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>
              {selectedQuery ? "Edit Query" : "Create New Query"}
            </DialogTitle>
            <DialogDescription>
              Configure your data extraction query using the query builder
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <QueryBuilder
                sources={sources}
                onQueryChange={handleSaveQuery}
                onPreview={handlePreviewQuery}
                onValidation={handleQueryValidation}
                initialQuery={selectedQuery || undefined}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
