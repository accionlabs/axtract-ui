// src/features/fileManager/components/FileCreationForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileConfiguration, FileFormat, SFTPConfiguration } from '../types';
import { ChevronRight, ChevronLeft } from 'lucide-react';
const defaultSFTPConfig: SFTPConfiguration = {
  host: '',
  port: 22,
  username: '',
  path: '',
};

interface FileCreationFormProps {
  onSubmit: (data: Partial<FileConfiguration>) => void;
  onCancel: () => void;
  availableLayouts: Array<{ id: string; name: string; }>;
}

export default function FileCreationForm({ onSubmit, onCancel, availableLayouts }: FileCreationFormProps) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<Partial<FileConfiguration>>({
    status: 'draft',
    format: 'CSV'
  });

  const handleNext = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (isStepValid()) {
      onSubmit(formData);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.layoutId;
      case 2:
        return formData.format;
      case 3:
        return !formData.sftpConfig || (
          formData.sftpConfig.host &&
          formData.sftpConfig.username &&
          formData.sftpConfig.path
        );
      default:
        return true;
    }
  };

  const updateFormData = (update: Partial<FileConfiguration>) => {
    setFormData(prev => ({ ...prev, ...update }));
  };

  const handleSFTPConfigUpdate = (field: keyof SFTPConfiguration, value: string | number) => {
    if (formData.sftpConfig) {
      const updatedConfig: SFTPConfiguration = {
        ...formData.sftpConfig,
        [field]: value
      };

      updateFormData({
        sftpConfig: updatedConfig
      });
    }
  };

  const handleSFTPPortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const portValue = parseInt(e.target.value);
    const port = isNaN(portValue) ? 22 : Math.max(1, Math.min(65535, portValue));
    handleSFTPConfigUpdate('port', port);
  };

  const handleSFTPHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const host = e.target.value.trim();
    handleSFTPConfigUpdate('host', host);
  };

  const handleSFTPUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.trim();
    handleSFTPConfigUpdate('username', username);
  };

  const handleSFTPPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const path = e.target.value.trim();
    handleSFTPConfigUpdate('path', path);
  };

  const handleSFTPHostKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const knownHostKey = e.target.value.trim();
    handleSFTPConfigUpdate('knownHostKey', knownHostKey);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New File Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            {['Basic Info', 'File Format', 'SFTP Setup', 'Schedule'].map((label, index) => (
              <div
                key={label}
                className={`flex items-center ${index + 1 === step ? 'text-primary' : 'text-gray-400'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index + 1 === step ? 'bg-primary text-white' : 'bg-gray-100'}
                `}>
                  {index + 1}
                </div>
                <span className="ml-2">{label}</span>
                {index < 3 && <div className="w-16 h-px bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">File Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Enter file name"
                />
              </div>
              <div>
                <Label htmlFor="layout">Select Layout</Label>
                <Select
                  value={formData.layoutId}
                  onValueChange={(value) => updateFormData({ layoutId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLayouts.map(layout => (
                      <SelectItem key={layout.id} value={layout.id}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: File Format */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>File Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => updateFormData({ format: value as FileFormat })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="TSV">TSV (Tab Separated)</SelectItem>
                    <SelectItem value="FIXED">Fixed Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* SFTP Setup Section */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={!!formData.sftpConfig}
                  onCheckedChange={(checked) =>
                    updateFormData({
                      sftpConfig: checked ? defaultSFTPConfig : undefined
                    })
                  }
                />
                <Label>Enable SFTP Transfer</Label>
              </div>

              {formData.sftpConfig && (
                <>
                  <div>
                    <Label htmlFor="sftpHost">SFTP Host</Label>
                    <Input
                      id="sftpHost"
                      value={formData.sftpConfig.host}
                      onChange={handleSFTPHostChange}
                      placeholder="sftp.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sftpPort">Port</Label>
                    <Input
                      id="sftpPort"
                      type="number"
                      min={1}
                      max={65535}
                      value={formData.sftpConfig.port}
                      onChange={handleSFTPPortChange}
                      placeholder="22"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sftpUsername">Username</Label>
                    <Input
                      id="sftpUsername"
                      value={formData.sftpConfig.username}
                      onChange={handleSFTPUserChange}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sftpPath">Remote Path</Label>
                    <Input
                      id="sftpPath"
                      value={formData.sftpConfig.path}
                      onChange={handleSFTPPathChange}
                      placeholder="/uploads"
                    />
                  </div>
                  <div>
                    <Label htmlFor="knownHostKey">Known Host Key (Optional)</Label>
                    <Input
                      id="knownHostKey"
                      value={formData.sftpConfig.knownHostKey}
                      onChange={handleSFTPHostKeyChange}
                      placeholder="SSH host key"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={!!formData.scheduleConfig}
                  onCheckedChange={(checked) =>
                    updateFormData({
                      scheduleConfig: checked
                        ? { frequency: 'daily', time: '00:00', timezone: 'UTC' }
                        : undefined
                    })
                  }
                />
                <Label>Enable Scheduling</Label>
              </div>

              {formData.scheduleConfig && (
                <>
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={formData.scheduleConfig.frequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                        updateFormData({
                          scheduleConfig: { ...formData.scheduleConfig!, frequency: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduleTime">Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={formData.scheduleConfig.time}
                      onChange={(e) => updateFormData({
                        scheduleConfig: { ...formData.scheduleConfig!, time: e.target.value }
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={step === 1 ? onCancel : handleBack}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={!isStepValid()}
            >
              {step === 4 ? 'Create File' : 'Next'}
              {step !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};