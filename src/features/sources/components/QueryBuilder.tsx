import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  X,
  ArrowRight,
  Database,
  Play,
  Save,
  Table2,
} from "lucide-react";
import {
  QueryDefinition,
  //  QueryResult,
  Field,
  QuerySource,
  JoinCondition,
  //  FilterCondition,
  DataSource,
  ValidationMessage,
  QueryValidation,
} from "../types";
import ValidationDetails from "./ValidationDetails";

import { validateQuery, isQueryValid } from "../utils/validation";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// New JoinForm component for better organization
function JoinForm({
  sources,
  onAddJoin,
  availableFields,
}: {
  sources: QuerySource[];
  onAddJoin: (join: JoinCondition) => void;
  availableFields: Field[];
}) {
  const [leftSource, setLeftSource] = useState<string>("");
  const [rightSource, setRightSource] = useState<string>("");
  const [leftField, setLeftField] = useState<string>("");
  const [rightField, setRightField] = useState<string>("");
  const [joinType, setJoinType] = useState<"INNER" | "LEFT" | "RIGHT" | "FULL">(
    "INNER"
  );

  const handleSubmit = () => {
    const left = availableFields.find(
      (f) => f.source === leftSource && f.name === leftField
    );
    const right = availableFields.find(
      (f) => f.source === rightSource && f.name === rightField
    );

    if (left && right) {
      onAddJoin({
        leftField: left,
        rightField: right,
        type: joinType,
      });

      // Reset form
      setLeftSource("");
      setRightSource("");
      setLeftField("");
      setRightField("");
      setJoinType("INNER");
    }
  };

  const getFieldsForSource = (sourceAlias: string) =>
    availableFields.filter((f) => f.source === sourceAlias);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Left side configuration */}
        <div className="space-y-2">
          <Select value={leftSource} onValueChange={setLeftSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select left source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.alias} value={source.alias}>
                  {source.alias}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={leftField}
            onValueChange={setLeftField}
            disabled={!leftSource}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select left field" />
            </SelectTrigger>
            <SelectContent>
              {getFieldsForSource(leftSource).map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side configuration */}
        <div className="space-y-2">
          <Select value={rightSource} onValueChange={setRightSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select right source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.alias} value={source.alias}>
                  {source.alias}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={rightField}
            onValueChange={setRightField}
            disabled={!rightSource}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select right field" />
            </SelectTrigger>
            <SelectContent>
              {getFieldsForSource(rightSource).map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Join type selection */}
        <div className="col-span-2">
          <Select
            value={joinType}
            onValueChange={(value: any) => setJoinType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Join type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INNER">Inner Join</SelectItem>
              <SelectItem value="LEFT">Left Join</SelectItem>
              <SelectItem value="RIGHT">Right Join</SelectItem>
              <SelectItem value="FULL">Full Join</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add join button */}
        <Button
          className="col-span-2"
          onClick={handleSubmit}
          disabled={!leftSource || !rightSource || !leftField || !rightField}
        >
          Add Join
        </Button>
      </div>
    </Card>
  );
}

// Add FieldMetadata type for source fields
interface FieldMetadata {
  name: string;
  type: string;
  nullable: boolean;
}

interface QueryBuilderProps {
  sources: DataSource[];
  onQueryChange: (query: QueryDefinition) => void;
  onPreview: (query: QueryDefinition) => Promise<any[]>;
  onValidation: (validation: QueryValidation) => void;
  initialQuery?: QueryDefinition;
}

export default function QueryBuilder({
  sources,
  onQueryChange,
  onPreview,
  onValidation,
  initialQuery,
}: QueryBuilderProps) {
  // Add validation to state
  const [validation, setValidation] = useState<ValidationMessage[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "sources" | "fields" | "joins" | "preview"
  >("fields");
  const [query, setQuery] = useState<QueryDefinition>(() => {
    if (initialQuery) {
      return initialQuery;
    }

    return {
      id: `query-${Date.now()}`,
      name: "New Query",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sources: [],
      selectedFields: [],
      joins: [],
      filters: [],
      groupBy: [],
      orderBy: [],
      aggregates: [],
    };
  });

  const handleAddSource = (sourceId: string, table?: string) => {
    const newSource: QuerySource = {
      sourceId,
      table,
      alias: `s${query.sources.length + 1}`,
    };
    setQuery((prev) => ({
      ...prev,
      sources: [...prev.sources, newSource],
    }));
  };

  const handleRemoveSource = (index: number) => {
    setQuery((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
      selectedFields: prev.selectedFields.filter(
        (f) => f.source !== prev.sources[index].alias
      ),
      joins: prev.joins.filter(
        (j) =>
          j.leftField.source !== prev.sources[index].alias &&
          j.rightField.source !== prev.sources[index].alias
      ),
    }));
  };

  const handleAddField = (field: Field) => {
    setQuery((prev) => ({
      ...prev,
      selectedFields: [...prev.selectedFields, field],
    }));
  };

  const handleRemoveField = (index: number) => {
    setQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.filter((_, i) => i !== index),
    }));
  };

  const handleAddJoin = (join: JoinCondition) => {
    setQuery((prev) => ({
      ...prev,
      joins: [...prev.joins, join],
    }));
  };

  // Add validation check when query changes
  useEffect(() => {
    const messages = validateQuery(query);
    setValidation(messages);

    // Notify parent of validation status if callback provided
    if (onValidation) {
      onValidation({
        isValid: isQueryValid(query),
        messages,
        timestamp: new Date().toISOString(),
      });
    }
  }, [query, onValidation]);

  // Add validation display in the UI
  const ValidationDisplay = () => {
    if (validation.length === 0) return null;

    return (
      <div className="space-y-2">
        {validation.map((message, index) => (
          <div
            key={index}
            className={cn(
              "p-2 rounded-md text-sm",
              message.severity === "error" &&
                "bg-red-50 text-red-800 border-red-200",
              message.severity === "warning" &&
                "bg-yellow-50 text-yellow-800 border-yellow-200",
              message.severity === "info" &&
                "bg-blue-50 text-blue-800 border-blue-200"
            )}
          >
            <div className="flex items-center gap-2">
              {message.severity === "error" && (
                <AlertCircle className="h-4 w-4" />
              )}
              {message.severity === "warning" && (
                <AlertTriangle className="h-4 w-4" />
              )}
              {message.severity === "info" && <Info className="h-4 w-4" />}
              <span>{message.message}</span>
            </div>
            {message.field && (
              <span className="text-xs text-muted-foreground ml-6">
                Field: {message.field}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Add validation check before preview
  const handlePreview = async () => {
    if (!isQueryValid(query)) {
      toast({
        title: "Invalid Query",
        description: "Please fix validation errors before running preview",
        variant: "destructive",
      });
      return;
    }

    setPreviewLoading(true);
    try {
      const data = await onPreview(query);
      setPreviewData(data);
    } catch (error) {
      console.error("Preview failed:", error);
      toast({
        title: "Preview Failed",
        description:
          "Failed to generate preview. Please check your query configuration.",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Show validation at the top if there are any errors */}
      {validation.length > 0 && (
        <div className="p-4 border-b">
          <ValidationDetails messages={validation} expanded={false} />
        </div>
      )}
      {/* Tabs Header */}
      <div className="border-b px-4 py-2 bg-background sticky top-0 z-10">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "sources" ? "default" : "outline"}
            onClick={() => setActiveTab("sources")}
            className={cn(validation.some((v) => v.source) && "border-red-500")}
          >
            Sources
            {validation.some((v) => v.source) && (
              <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
            )}
          </Button>
          <Button
            variant={activeTab === "fields" ? "default" : "outline"}
            onClick={() => setActiveTab("fields")}
            disabled={query.sources.length === 0}
            className={cn(validation.some((v) => v.field) && "border-red-500")}
          >
            Fields
            {validation.some((v) => v.field) && (
              <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
            )}
          </Button>
          <Button
            variant={activeTab === "joins" ? "default" : "outline"}
            onClick={() => setActiveTab("joins")}
            disabled={query.sources.length < 2}
            className={cn(
              validation.some((v) => v.code === "INVALID_JOIN") &&
                "border-red-500"
            )}
          >
            Joins
            {validation.some((v) => v.code === "INVALID_JOIN") && (
              <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
            )}
          </Button>
          <Button
            variant={activeTab === "preview" ? "default" : "outline"}
            onClick={() => setActiveTab("preview")}
            disabled={
              query.selectedFields.length === 0 ||
              validation.some((v) => v.severity === "error")
            }
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Show tab-specific validation messages */}
          {activeTab === "sources" && validation.some((v) => v.source) && (
            <div className="mb-4">
              <ValidationDetails
                messages={validation.filter((v) => v.source)}
                expanded={true}
              />
            </div>
          )}

          {activeTab === "fields" && validation.some((v) => v.field) && (
            <div className="mb-4">
              <ValidationDetails
                messages={validation.filter((v) => v.field)}
                expanded={true}
              />
            </div>
          )}

          {activeTab === "joins" &&
            validation.some((v) => v.code === "INVALID_JOIN") && (
              <div className="mb-4">
                <ValidationDetails
                  messages={validation.filter((v) => v.code === "INVALID_JOIN")}
                  expanded={true}
                />
              </div>
            )}
          {activeTab === "sources" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {query.sources.map((source, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Database className="h-3 w-3" />
                    {source.table
                      ? `${source.sourceId}.${source.table}`
                      : source.sourceId}
                    <span className="text-xs text-muted-foreground">
                      ({source.alias})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveSource(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                <Select onValueChange={handleAddSource}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validation display for sources */}
              {validation.filter((v) => v.source).length > 0 && (
                <div className="mt-4">
                  <ValidationDisplay />
                </div>
              )}
            </div>
          )}

          {activeTab === "fields" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {/* Selected fields display */}
                {query.selectedFields.map((field, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Table2 className="h-3 w-3" />
                    {`${field.source}.${field.name}`}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveField(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {/* Available fields by source */}
              <div className="space-y-6">
                {query.sources.map((source) => {
                  const sourceConfig = sources.find(
                    (s) => s.id === source.sourceId
                  );
                  return (
                    <div key={source.alias} className="space-y-2">
                      <h4 className="font-medium">{sourceConfig?.name}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {sourceConfig?.metadata?.tables?.[0]?.fields.map(
                          (field: FieldMetadata) => (
                            <Button
                              key={field.name}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAddField({
                                  name: field.name,
                                  type: field.type,
                                  source: source.alias,
                                  table: source.table,
                                })
                              }
                              className="justify-start"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {field.name}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "joins" && (
            <div className="space-y-4">
              {/* Existing joins */}
              {query.joins.map((join, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>
                    {join.leftField.source}.{join.leftField.name}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    {join.rightField.source}.{join.rightField.name}
                  </span>
                  <Badge>{join.type} JOIN</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery((prev) => ({
                        ...prev,
                        joins: prev.joins.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Join form */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Add New Join</h4>
                <JoinForm
                  sources={query.sources}
                  onAddJoin={handleAddJoin}
                  availableFields={query.selectedFields}
                />
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              {/* Preview controls */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={handlePreview}
                  disabled={previewLoading || query.selectedFields.length === 0}
                >
                  {previewLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Preview
                    </>
                  )}
                </Button>
                <Badge variant="secondary">{previewData.length} rows</Badge>
              </div>

              {/* Preview table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {query.selectedFields.map((field, index) => (
                        <TableHead key={index}>{field.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 100).map((row, index) => (
                      <TableRow key={index}>
                        {query.selectedFields.map((field, fieldIndex) => (
                          <TableCell key={fieldIndex}>
                            {row[field.name]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t bg-muted/50 p-4">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {query.sources.length} sources
            </Badge>
            <Badge variant="outline" className="font-mono">
              {query.selectedFields.length} fields
            </Badge>
            <Badge variant="outline" className="font-mono">
              {query.joins.length} joins
            </Badge>
            {validation.length > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "font-mono",
                  validation.some((m) => m.severity === "error") &&
                    "border-red-500 text-red-500",
                  validation.some((m) => m.severity === "warning") &&
                    !validation.some((m) => m.severity === "error") &&
                    "border-yellow-500 text-yellow-500"
                )}
              >
                {validation.filter((m) => m.severity === "error").length > 0
                  ? `${
                      validation.filter((m) => m.severity === "error").length
                    } errors`
                  : `${
                      validation.filter((m) => m.severity === "warning").length
                    } warnings`}
              </Badge>
            )}
          </div>
          <Button
            onClick={() => onQueryChange(query)}
            disabled={
              query.selectedFields.length === 0 ||
              validation.some((m) => m.severity === "error")
            }
          >
            <Save className="h-4 w-4 mr-2" />
            Save Query
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
