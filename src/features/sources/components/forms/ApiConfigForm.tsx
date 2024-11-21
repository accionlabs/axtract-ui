import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SOURCE_CONFIG, ApiConfig } from "../../types";
import { FormValues } from "../../schemas/form-schemas";
import { Card } from "@/components/ui/card";

interface ApiConfigFormProps {
  form: UseFormReturn<FormValues>;
  initialData?: ApiConfig;
  disabled?: boolean;
}

export default function ApiConfigForm({
  form,
  initialData,
  disabled,
}: ApiConfigFormProps) {
  // Set initial values when component mounts
  React.useEffect(() => {
    if (initialData) {
      form.setValue("api.url", initialData.url);
      form.setValue("api.method", initialData.method);
      form.setValue("api.headers", initialData.headers || {});
      form.setValue("api.timeout", initialData.timeout);
      form.setValue("api.authentication", initialData.authentication);
    }
  }, [initialData, form]);

  const handleAddHeader = () => {
    const currentHeaders = form.getValues("api.headers") || {};
    const newHeaders = { ...currentHeaders, "": "" };
    form.setValue("api.headers", newHeaders);
  };

  const handleRemoveHeader = (key: string) => {
    const currentHeaders = form.getValues("api.headers") || {};
    const { [key]: _, ...newHeaders } = currentHeaders;
    form.setValue("api.headers", newHeaders);
  };

  const handleHeaderChange = (
    oldKey: string,
    newKey: string,
    value: string
  ) => {
    const currentHeaders = form.getValues("api.headers") || {};
    const newHeaders = { ...currentHeaders };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    form.setValue("api.headers", newHeaders);
  };

  return (
    <div className="space-y-6">
      {/* Basic API Configuration */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="api.url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Endpoint URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://api.example.com/v1/data"
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                Enter the full URL of the API endpoint
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="api.method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HTTP Method</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select HTTP method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Headers Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Request Headers</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddHeader}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Header
            </Button>
          </div>

          <Card className="p-4">
            <div className="space-y-2">
              {Object.entries(form.watch("api.headers") || {}).map(
                ([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={key}
                      onChange={(e) =>
                        handleHeaderChange(key, e.target.value, value)
                      }
                      className="w-1/3"
                      disabled={disabled}
                    />
                    <Input
                      placeholder="Value"
                      value={value}
                      onChange={(e) =>
                        handleHeaderChange(key, key, e.target.value)
                      }
                      className="flex-1"
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHeader(key)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
              {Object.keys(form.watch("api.headers") || {}).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No headers configured
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Authentication Section */}
      <FormField
        control={form.control}
        name="api.authentication.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Authentication Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select authentication type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("api.authentication.type") === "basic" && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="api.authentication.credentials.username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="api.authentication.credentials.password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    disabled={disabled}
                    placeholder={initialData ? "••••••••" : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {form.watch("api.authentication.type") === "bearer" && (
        <FormField
          control={form.control}
          name="api.authentication.credentials.token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bearer Token</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  disabled={disabled}
                  placeholder={initialData ? "••••••••" : undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {form.watch("api.authentication.type") === "oauth2" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="api.authentication.credentials.clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="api.authentication.credentials.clientSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Secret</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    disabled={disabled}
                    placeholder={initialData ? "••••••••" : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="api.authentication.credentials.tokenUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://auth.example.com/oauth/token"
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Additional Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel>Accepted Content Types</FormLabel>
          <div className="flex flex-wrap gap-2">
            {SOURCE_CONFIG.api.supportedContentTypes.map((type) => (
              <Badge key={type} variant="secondary">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <FormField
          control={form.control}
          name="api.timeout"
          render={({ field: { onChange, value } }) => (
            <FormItem>
              <FormLabel>Timeout (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={value || ""}
                  onChange={(e) => onChange(Number(e.target.value))}
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                Maximum time to wait for response
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="api.validateSsl"
          render={({ field: { onChange, value } }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Validate SSL Certificate</FormLabel>
                <FormDescription>
                  Verify SSL certificates when making requests
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={value || false}
                  onCheckedChange={onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
