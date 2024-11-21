import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ValidationMessage } from "../types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ValidationDetailsProps {
  messages: ValidationMessage[];
  expanded?: boolean;
}

export default function ValidationDetails({ 
  messages, 
  expanded = false 
}: ValidationDetailsProps) {
  if (messages.length === 0) return null;

  // Group messages by severity
  const groupedMessages = messages.reduce((acc, msg) => {
    acc[msg.severity] = acc[msg.severity] || [];
    acc[msg.severity].push(msg);
    return acc;
  }, {} as Record<string, ValidationMessage[]>);

  const severityOrder = ['error', 'warning', 'info'];
  
  return (
    <Collapsible defaultOpen={expanded} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {groupedMessages['error']?.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              {groupedMessages['error'].length} Errors
            </Badge>
          )}
          {groupedMessages['warning']?.length > 0 && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500 gap-1">
              <AlertTriangle className="h-3 w-3" />
              {groupedMessages['warning'].length} Warnings
            </Badge>
          )}
          {groupedMessages['info']?.length > 0 && (
            <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1">
              <Info className="h-3 w-3" />
              {groupedMessages['info'].length} Info
            </Badge>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="space-y-2">
          {severityOrder.map(severity => 
            groupedMessages[severity]?.length > 0 && (
              <Alert 
                key={severity}
                variant={severity === 'error' ? 'destructive' : 'default'}
                className={cn(
                  severity === 'warning' && "border-yellow-500 text-yellow-500",
                  severity === 'info' && "border-blue-500 text-blue-500"
                )}
              >
                <div className="flex items-center gap-2">
                  {severity === 'error' && <AlertCircle className="h-4 w-4" />}
                  {severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {severity === 'info' && <Info className="h-4 w-4" />}
                  <AlertTitle>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}s
                  </AlertTitle>
                </div>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    {groupedMessages[severity].map((msg, idx) => (
                      <div key={idx} className="space-y-1">
                        <p>{msg.message}</p>
                        {(msg.field || msg.source) && (
                          <div className="flex gap-2 text-sm opacity-80">
                            {msg.field && (
                              <Badge variant="outline" className="text-xs">
                                Field: {msg.field}
                              </Badge>
                            )}
                            {msg.source && (
                              <Badge variant="outline" className="text-xs">
                                Source: {msg.source}
                              </Badge>
                            )}
                          </div>
                        )}
                        {msg.context && Object.keys(msg.context).length > 0 && (
                          <div className="text-sm mt-1 opacity-80">
                            {Object.entries(msg.context)
                              .filter(([key]) => key !== 'field' && key !== 'source')
                              .map(([key, value]) => (
                                <div key={key} className="pl-4">
                                  {key}: {JSON.stringify(value)}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}