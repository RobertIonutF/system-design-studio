'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useSimulationStore } from '@/stores/simulation-store';
import { SimulationStatus } from '@/types/simulation';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Gauge,
  Terminal,
  BarChart3,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SimulationControlPanel() {
  const {
    status,
    speed,
    currentTime,
    metrics,
    result,
    showLogConsole,
    showMetricsDashboard,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    setSpeed,
    setShowConfigModal,
    setShowLogConsole,
    setShowMetricsDashboard,
    setShowSummary,
  } = useSimulationStore();

  const isRunning = status === SimulationStatus.RUNNING;
  const isPaused = status === SimulationStatus.PAUSED;
  const isIdle = status === SimulationStatus.IDLE;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const speedOptions = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
    { value: 10, label: '10x' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowConfigModal(true)}
              variant="outline"
              size="sm"
              disabled={isRunning}
              title="Configure Simulation"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {isIdle && (
              <Button
                onClick={startSimulation}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                title="Start Simulation"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}

            {isRunning && (
              <Button
                onClick={pauseSimulation}
                variant="default"
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
                title="Pause Simulation"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}

            {isPaused && (
              <Button
                onClick={resumeSimulation}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                title="Resume Simulation"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            )}

            {!isIdle && (
              <Button
                onClick={stopSimulation}
                variant="destructive"
                size="sm"
                title="Stop Simulation"
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}

            <Button
              onClick={resetSimulation}
              variant="outline"
              size="sm"
              disabled={isIdle}
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* View Results Button */}
            {result && (
              <Button
                onClick={() => setShowSummary(true)}
                variant="outline"
                size="sm"
                title="View Results"
              >
                <ClipboardCheck className="w-4 h-4 mr-1" />
                Results
              </Button>
            )}
          </div>

          {/* Center: Time & Metrics */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-mono font-semibold">{formatTime(currentTime)}</span>
            </div>

            {metrics && (
              <>
                <div className="h-4 w-px bg-border" />
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">RPS:</span>
                  <span className="font-mono font-semibold">
                    {metrics.requestsPerSecond.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="font-mono font-semibold">
                    {metrics.averageLatency.toFixed(1)}ms
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Success:</span>
                  <span className={cn(
                    "font-mono font-semibold",
                    metrics.errorRate < 0.01 ? "text-green-600" :
                    metrics.errorRate < 0.05 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {((1 - metrics.errorRate) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-mono font-semibold">
                    {metrics.activeRequests}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: Speed & View Controls */}
          <div className="flex items-center gap-2">
            {/* Speed Control */}
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              {speedOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setSpeed(option.value)}
                  variant={speed === option.value ? 'default' : 'outline'}
                  size="sm"
                  disabled={isIdle}
                  className="px-2 min-w-[40px]"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="h-6 w-px bg-border mx-1" />

            {/* View Toggles */}
            <Button
              onClick={() => setShowLogConsole(!showLogConsole)}
              variant={showLogConsole ? 'default' : 'outline'}
              size="sm"
              title="Toggle Log Console"
            >
              <Terminal className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setShowMetricsDashboard(!showMetricsDashboard)}
              variant={showMetricsDashboard ? 'default' : 'outline'}
              size="sm"
              title="Toggle Metrics Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isRunning && "bg-green-500 animate-pulse",
            isPaused && "bg-yellow-500",
            isIdle && "bg-gray-400",
            status === SimulationStatus.COMPLETED && "bg-blue-500",
            status === SimulationStatus.STOPPED && "bg-red-500"
          )} />
          <span>
            {status === SimulationStatus.RUNNING && 'Simulation Running'}
            {status === SimulationStatus.PAUSED && 'Simulation Paused'}
            {status === SimulationStatus.IDLE && 'Ready to Simulate'}
            {status === SimulationStatus.COMPLETED && 'Simulation Completed'}
            {status === SimulationStatus.STOPPED && 'Simulation Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
}

