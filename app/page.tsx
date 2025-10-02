'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponentPalette } from '@/components/ComponentPalette';
import { ChallengeList } from '@/components/ChallengeList';
import { DesignCanvas } from '@/components/DesignCanvas';
import { RequirementsPanel } from '@/components/RequirementsPanel';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NodeType } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { User } from 'lucide-react';
import { useProgressStore } from '@/stores/progress-store';
import {
  SimulationControlPanel,
  SimulationConfigModal,
  SimulationLogConsole,
  SimulationMetricsDashboard,
  SimulationSummary,
} from '@/components/simulation';

export default function Home() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { level, totalXP } = useProgressStore();
  
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-screen flex flex-col">
      <Toaster richColors position="top-right" />
      
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Design Practice Studio</h1>
            <p className="text-sm text-muted-foreground">
              Master system design through interactive challenges
            </p>
          </div>
          
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="w-4 h-4" />
                Level {level} · {totalXP} XP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Your Profile</DialogTitle>
              </DialogHeader>
              <UserProfile />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[300px_1fr_320px] gap-4 p-4 overflow-hidden">
        {/* Left Sidebar - Components & Challenges */}
        <div className="h-full">
          <Tabs defaultValue="challenges" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
            </TabsList>
            <TabsContent value="challenges" className="flex-1 mt-4">
              <ChallengeList />
            </TabsContent>
            <TabsContent value="components" className="flex-1 mt-4">
              <ComponentPalette onDragStart={onDragStart} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Design Canvas */}
        <div className="h-full border rounded-lg overflow-hidden bg-background">
          <DesignCanvas />
        </div>

        {/* Right Sidebar - Requirements */}
        <div className="h-full">
          <RequirementsPanel />
        </div>
      </div>

      {/* Simulation Components */}
      <SimulationControlPanel />
      <SimulationConfigModal />
      <SimulationLogConsole />
      <SimulationMetricsDashboard />
      <SimulationSummary />
    </div>
  );
}
