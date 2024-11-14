// src/features/monitoring/components/MonitoringFilters.tsx

import * as React from "react";
import { Calendar as CalendarIcon, X, Check } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, subDays, subHours } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { MonitoringFilters, ProcessingStatus, FileSource } from "../types";
import { dateRangeOptions, statusColors } from "../mockData";

interface MonitoringFiltersBarProps {
  filters: MonitoringFilters;
  onFiltersChange: (filters: Partial<MonitoringFilters>) => void;
  isLoading?: boolean;
}

const statusOptions: { label: string; value: ProcessingStatus; }[] = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const sourceOptions: { label: string; value: FileSource; }[] = [
  { label: "Manual", value: "manual" },
  { label: "Scheduled", value: "scheduled" },
];

export function MonitoringFiltersBar({ 
  filters, 
  onFiltersChange,
  isLoading 
}: MonitoringFiltersBarProps) {
  const [dateOpen, setDateOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    filters.dateRange ? {
      from: new Date(filters.dateRange.start),
      to: new Date(filters.dateRange.end)
    } : undefined
  );

  // Handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFiltersChange({
        dateRange: {
          start: range.from.toISOString(),
          end: range.to.toISOString()
        }
      });
    } else {
      onFiltersChange({ dateRange: undefined });
    }
    setDateOpen(false);
  };

  // Handle status selection
  const handleStatusToggle = (status: ProcessingStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFiltersChange({ status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  // Handle source selection
  const handleSourceToggle = (source: FileSource) => {
    const currentSources = filters.source || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    onFiltersChange({ source: newSources.length > 0 ? newSources : undefined });
  };

    // Handle preset date range selection
    const handleDatePreset = (value: string) => {
        const now = new Date();
        let range: DateRange | undefined;
    
        switch (value) {
          case '24h':
            range = {
              from: startOfDay(subHours(now, 24)),
              to: endOfDay(now)
            };
            break;
          case '7d':
            range = {
              from: startOfDay(subDays(now, 7)),
              to: endOfDay(now)
            };
            break;
          case '30d':
            range = {
              from: startOfDay(subDays(now, 30)),
              to: endOfDay(now)
            };
            break;
          case 'custom':
            setDateOpen(true);
            return;
          default:
            range = undefined;
        }
    
        setDateRange(range);
        if (range?.from && range?.to) {
          onFiltersChange({
            dateRange: {
              start: range.from.toISOString(),
              end: range.to.toISOString()
            }
          });
        } else {
          onFiltersChange({ dateRange: undefined });
        }
        setDateOpen(false);
      };

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ fileName: event.target.value || undefined });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setDateRange(undefined);
    onFiltersChange({
      fileName: undefined,
      status: undefined,
      dateRange: undefined,
      source: undefined,
      page: 1
    });
  };

  const hasActiveFilters = !!(
    filters.fileName ||
    filters.status?.length ||
    filters.dateRange ||
    filters.source?.length
  );

  return (
    <div className="space-y-4 monitoring-filters">
      {/* Top row with search and clear filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by file name..."
            value={filters.fileName || ""}
            onChange={handleSearch}
            className="max-w-sm"
            disabled={isLoading}
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
          >
            Clear filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter buttons row */}
      <div className="flex flex-wrap gap-2">
        {/* Date Range Filter */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={filters.dateRange ? "default" : "outline"}
              className="h-8 border-dashed"
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange ? (
                format(new Date(filters.dateRange.start), "PPP") + " - " +
                format(new Date(filters.dateRange.end), "PPP")
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {/* Added the presets section */}
            <div className="border-b p-3">
              <div className="flex items-center gap-2">
                {dateRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDatePreset(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              disabled={isLoading}
            />
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={filters.status?.length ? "default" : "outline"}
              className="h-8 border-dashed"
              disabled={isLoading}
            >
              Status
              {filters.status?.length ? (
                <Badge 
                  variant="secondary" 
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {filters.status.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-2">
              {statusOptions.map((option) => {
                const isSelected = filters.status?.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => handleStatusToggle(option.value)}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "border"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <Badge className={statusColors[option.value]}>
                      {option.label}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Source Filter */}
        <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={filters.source?.length ? "default" : "outline"}
              className="h-8 border-dashed"
              disabled={isLoading}
            >
              Source
              {filters.source?.length ? (
                <Badge 
                  variant="secondary" 
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {filters.source.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-2">
              {sourceOptions.map((option) => {
                const isSelected = filters.source?.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => handleSourceToggle(option.value)}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "border"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="capitalize">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-wrap gap-2">
              {filters.status?.map((status) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="h-8 px-2 flex items-center gap-1"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleStatusToggle(status)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.source?.map((source) => (
                <Badge
                  key={source}
                  variant="secondary"
                  className="h-8 px-2 flex items-center gap-1"
                >
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleSourceToggle(source)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}