'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimulationStore } from '@/stores/simulation-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Save, Zap } from 'lucide-react';

export function SimulationConfigModal() {
  const {
    showConfigModal,
    config,
    presets,
    currentPreset,
    setShowConfigModal,
    updateConfig,
    loadPreset,
    savePreset,
  } = useSimulationStore();

  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName, presetDescription, ['custom']);
      setPresetName('');
      setPresetDescription('');
    }
  };

  return (
    <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Simulation Configuration</DialogTitle>
          <DialogDescription>
            Configure system parameters and environment settings for the simulation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="system">System Inputs</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary ${
                      currentPreset === preset.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => loadPreset(preset.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{preset.name}</h3>
                      {currentPreset === preset.id && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {preset.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>RPS: {preset.config.requestsPerSecond}</div>
                      <div>Duration: {preset.config.duration}s</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Save Current Configuration</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <Button onClick={handleSavePreset} size="sm" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preset
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* System Inputs Tab */}
          <TabsContent value="system" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <ConfigInput
                  label="Requests Per Second"
                  value={config.requestsPerSecond}
                  onChange={(value) => updateConfig({ requestsPerSecond: value })}
                  min={1}
                  max={10000}
                  step={10}
                  description="Number of incoming requests per second"
                />

                <ConfigInput
                  label="Concurrent Users"
                  value={config.concurrentUsers}
                  onChange={(value) => updateConfig({ concurrentUsers: value })}
                  min={1}
                  max={10000}
                  step={10}
                  description="Number of active simultaneous users"
                />

                <ConfigInput
                  label="Payload Size (KB)"
                  value={config.payloadSize}
                  onChange={(value) => updateConfig({ payloadSize: value })}
                  min={1}
                  max={1000}
                  step={1}
                  description="Average request payload size"
                />

                <ConfigInput
                  label="Error Rate (%)"
                  value={config.errorRate * 100}
                  onChange={(value) => updateConfig({ errorRate: value / 100 })}
                  min={0}
                  max={50}
                  step={0.1}
                  description="Percentage of requests that randomly fail"
                />

                <ConfigInput
                  label="Message Queue Depth"
                  value={config.messageQueueDepth}
                  onChange={(value) => updateConfig({ messageQueueDepth: value })}
                  min={10}
                  max={10000}
                  step={10}
                  description="Maximum queue capacity"
                />

                <ConfigInput
                  label="Cache Hit Ratio (%)"
                  value={config.cacheHitRatio * 100}
                  onChange={(value) => updateConfig({ cacheHitRatio: value / 100 })}
                  min={0}
                  max={100}
                  step={1}
                  description="Probability of cache serving a request"
                />

                <ConfigInput
                  label="DB Latency (ms)"
                  value={config.dbLatency}
                  onChange={(value) => updateConfig({ dbLatency: value })}
                  min={1}
                  max={1000}
                  step={1}
                  description="Average database query time"
                />

                <ConfigInput
                  label="Service CPU Cost (ms)"
                  value={config.serviceCpuCost}
                  onChange={(value) => updateConfig({ serviceCpuCost: value })}
                  min={1}
                  max={1000}
                  step={1}
                  description="Processing time per request"
                />

                <ConfigInput
                  label="Simulation Duration (seconds)"
                  value={config.duration}
                  onChange={(value) => updateConfig({ duration: value })}
                  min={5}
                  max={300}
                  step={5}
                  description="Total simulation runtime"
                />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Environment Tab */}
          <TabsContent value="environment" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Auto-Scaling</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically scale services based on load
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoScaling}
                  onChange={(e) => updateConfig({ autoScaling: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Failure Injection</h3>
                  <p className="text-sm text-muted-foreground">
                    Simulate random node failures
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.failureInjection}
                  onChange={(e) => updateConfig({ failureInjection: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Chaos Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Random latency spikes and packet drops
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.chaosMode}
                  onChange={(e) => updateConfig({ chaosMode: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="p-3 border rounded-lg">
                <h3 className="font-medium mb-2">Consistency Mode</h3>
                <div className="flex gap-2">
                  <Button
                    variant={config.consistencyMode === 'strong' ? 'default' : 'outline'}
                    onClick={() => updateConfig({ consistencyMode: 'strong' })}
                    className="flex-1"
                  >
                    Strong
                  </Button>
                  <Button
                    variant={config.consistencyMode === 'eventual' ? 'default' : 'outline'}
                    onClick={() => updateConfig({ consistencyMode: 'eventual' })}
                    className="flex-1"
                  >
                    Eventual
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {config.consistencyMode === 'strong' 
                    ? 'Affects latency and ordering guarantees' 
                    : 'Optimized for performance with relaxed consistency'}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowConfigModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            setShowConfigModal(false);
            // Configuration is auto-applied through updateConfig
          }}>
            <Zap className="w-4 h-4 mr-2" />
            Apply & Start
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ConfigInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  description: string;
}

function ConfigInput({ label, value, onChange, min, max, step, description }: ConfigInputProps) {
  return (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-medium text-sm">{label}</label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-24 px-2 py-1 border rounded text-right text-sm"
        />
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

