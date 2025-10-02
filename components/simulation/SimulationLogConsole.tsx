'use client';

import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulation-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Filter, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { SimulationEventType } from '@/types/simulation';
import { cn } from '@/lib/utils';

export function SimulationLogConsole() {
  const { 
    showLogConsole, 
    events, 
    logFilter, 
    setShowLogConsole, 
    setLogFilter 
  } = useSimulationStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new events arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  if (!showLogConsole) return null;

  const filteredEvents = events.filter(event => {
    switch (logFilter) {
      case 'errors':
        return event.severity === 'error';
      case 'performance':
        return [
          SimulationEventType.CACHE_HIT,
          SimulationEventType.CACHE_MISS,
          SimulationEventType.DB_QUERY,
          SimulationEventType.BACKLOG_WARNING,
          SimulationEventType.NODE_OVERLOAD
        ].includes(event.type);
      case 'scaling':
        return event.type === SimulationEventType.NODE_SCALED;
      default:
        return true;
    }
  });

  const getEventIcon = (severity?: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (ms: number) => {
    return `[${(ms / 1000).toFixed(2)}s]`;
  };

  return (
    <div className="fixed left-4 bottom-24 w-[600px] h-[300px] bg-background border rounded-lg shadow-lg flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Simulation Log</h3>
          <span className="text-xs text-muted-foreground">
            {filteredEvents.length} / {events.length} events
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Buttons */}
          <Button
            onClick={() => setLogFilter('all')}
            variant={logFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
          >
            All
          </Button>
          <Button
            onClick={() => setLogFilter('errors')}
            variant={logFilter === 'errors' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
          >
            Errors
          </Button>
          <Button
            onClick={() => setLogFilter('performance')}
            variant={logFilter === 'performance' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
          >
            Performance
          </Button>
          <Button
            onClick={() => setLogFilter('scaling')}
            variant={logFilter === 'scaling' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
          >
            Scaling
          </Button>
          <Button
            onClick={() => setShowLogConsole(false)}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Log Content */}
      <ScrollArea className="flex-1 p-2">
        <div ref={scrollRef} className="space-y-1 font-mono text-xs">
          {filteredEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No events to display
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded hover:bg-accent/50 transition-colors",
                  event.severity === 'error' && 'bg-red-50 dark:bg-red-950/20',
                  event.severity === 'warning' && 'bg-yellow-50 dark:bg-yellow-950/20',
                  event.severity === 'success' && 'bg-green-50 dark:bg-green-950/20'
                )}
              >
                {getEventIcon(event.severity)}
                <span className="text-muted-foreground min-w-[60px]">
                  {formatTimestamp(event.timestamp)}
                </span>
                <span className="flex-1">{event.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

