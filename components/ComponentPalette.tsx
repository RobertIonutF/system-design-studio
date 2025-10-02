'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { COMPONENT_METADATA } from '@/data/components';
import { 
  User, Globe, Scale, Server, Database, Zap, 
  ListOrdered, Rss, HardDrive, LineChart, Timer 
} from 'lucide-react';
import { NodeType } from '@/types';
import { cn } from '@/lib/utils';

const iconMap = {
  User, Globe, Scale, Server, Database, Zap, 
  ListOrdered, Rss, HardDrive, LineChart, Timer
};

interface ComponentPaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export function ComponentPalette({ onDragStart }: ComponentPaletteProps) {
  const categories = {
    entry: COMPONENT_METADATA.filter(c => c.category === 'entry'),
    gateway: COMPONENT_METADATA.filter(c => c.category === 'gateway'),
    compute: COMPONENT_METADATA.filter(c => c.category === 'compute'),
    storage: COMPONENT_METADATA.filter(c => c.category === 'storage'),
    messaging: COMPONENT_METADATA.filter(c => c.category === 'messaging'),
    observability: COMPONENT_METADATA.filter(c => c.category === 'observability'),
  };

  const categoryLabels = {
    entry: 'Entry Points',
    gateway: 'Gateway & Control',
    compute: 'Compute',
    storage: 'Storage',
    messaging: 'Messaging',
    observability: 'Observability',
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Components</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-6">
            {Object.entries(categories).map(([category, components]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <div className="space-y-2">
                  {components.map((component) => {
                    const IconName = component.icon as keyof typeof iconMap;
                    const Icon = iconMap[IconName] || Server;
                    
                    return (
                      <div
                        key={component.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, component.type)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border-2 cursor-grab',
                          'hover:shadow-md transition-all active:cursor-grabbing',
                          'bg-background hover:bg-accent'
                        )}
                      >
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{component.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {component.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

