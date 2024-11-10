// src/features/files/components/form-tabs/DeliveryConfigTab.tsx

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { FormSchema } from '../FileFormDialog';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface DeliveryConfigTabProps {
  form: UseFormReturn<FormSchema>;
  showSftp: boolean;
  setShowSftp: (show: boolean) => void;
  showEncryption: boolean;
  setShowEncryption: (show: boolean) => void;
}

export function DeliveryConfigTab({ 
  form, 
  showSftp, 
  setShowSftp,
  showEncryption,
  setShowEncryption
}: DeliveryConfigTabProps) {
  return (
    <ScrollArea className="h-[calc(100vh-25rem)]">

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SFTP Configuration</CardTitle>
          <Switch
            checked={showSftp}
            onCheckedChange={setShowSftp}
          />
        </CardHeader>
        {showSftp && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sftpConfig.host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sftpConfig.port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sftpConfig.username"
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
              name="sftpConfig.path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remote Path</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sftpConfig.knownHostKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Known Host Key</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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