// src/features/files/components/form-tabs/DeliveryConfigTab.tsx

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormSchema } from '../FileFormDialog';
import { 
  databaseOptions, 
  writeModeOptions, 
  defaultDatabaseConfig, 
  httpMethodOptions 
} from '../../mockData';

interface DeliveryConfigTabProps {
  form: UseFormReturn<FormSchema>;
  showDelivery: boolean;
  setShowDelivery: (show: boolean) => void;
  showEncryption: boolean;
  setShowEncryption: (show: boolean) => void;
}

export function DeliveryConfigTab({ 
  form, 
  showDelivery, 
  setShowDelivery,
  showEncryption,
  setShowEncryption
}: DeliveryConfigTabProps) {
  const deliveryType = form.watch('deliveryConfig.type');
  const selectedDbType = form.watch('deliveryConfig.database.type');

  return (
    <ScrollArea className="h-[calc(100vh-25rem)]">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Delivery Configuration</CardTitle>
          <Switch
            checked={showDelivery}
            onCheckedChange={setShowDelivery}
          />
        </CardHeader>
        {showDelivery && (
          <CardContent className="space-y-6">
            {/* Delivery Method Selection */}
            <FormField
              control={form.control}
              name="deliveryConfig.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sftp" id="sftp" />
                      <FormLabel htmlFor="sftp" className="font-normal">
                        SFTP Transfer
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="api" id="api" />
                      <FormLabel htmlFor="api" className="font-normal">
                        API Endpoint
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="database" id="database" />
                      <FormLabel htmlFor="database" className="font-normal">
                        Database
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormItem>
              )}
            />

            {/* SFTP Configuration */}
            {deliveryType === 'sftp' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">SFTP Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryConfig.sftp.host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="sftp.example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryConfig.sftp.port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            placeholder="22"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="deliveryConfig.sftp.username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryConfig.sftp.path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remote Path</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="/path/to/destination" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryConfig.sftp.knownHostKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Known Host Key (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* API Configuration */}
            {deliveryType === 'api' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">API Settings</h4>
                <FormField
                  control={form.control}
                  name="deliveryConfig.api.method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {httpMethodOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryConfig.api.url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://api.example.com/endpoint" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryConfig.api.headers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headers (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder='{
  "Authorization": "Bearer [token]",
  "Content-Type": "application/json"
}'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryConfig.api.timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            min={1}
                            max={300}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryConfig.api.validateSsl"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Validate SSL</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Database Configuration */}
            {deliveryType === 'database' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Database Settings</h4>
                <FormField
                  control={form.control}
                  name="deliveryConfig.database.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select database type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {databaseOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryConfig.database.host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="db.example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryConfig.database.port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            placeholder={defaultDatabaseConfig.port[selectedDbType]?.toString()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryConfig.database.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Database Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryConfig.database.schema"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schema</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="public" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="deliveryConfig.database.table"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryConfig.database.writeMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Write Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select write mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {writeModeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>PGP Encryption</CardTitle>
          <Switch
            checked={showEncryption}
            onCheckedChange={setShowEncryption}
          />
        </CardHeader>
        {showEncryption && (
          <CardContent>
            <FormField
              control={form.control}
              name="encryptionConfig.publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="font-mono"
                      placeholder="-----BEGIN PGP PUBLIC KEY-----"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        )}
      </Card>
    </ScrollArea>
  );
}