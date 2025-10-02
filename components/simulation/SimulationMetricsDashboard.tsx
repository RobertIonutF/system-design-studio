'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulation-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function SimulationMetricsDashboard() {
  const { showMetricsDashboard, engine, setShowMetricsDashboard } = useSimulationStore();

  if (!showMetricsDashboard || !engine) return null;

  const state = engine.getState();
  const metricsHistory = state.metricsHistory;

  // Transform data for charts
  const chartData = metricsHistory.map((snapshot) => ({
    time: snapshot.timestamp / 1000, // Convert to seconds
    rps: snapshot.system.requestsPerSecond,
    latency: snapshot.system.averageLatency,
    errorRate: snapshot.system.errorRate * 100,
    activeRequests: snapshot.system.activeRequests,
    queueDepth: snapshot.system.totalQueueDepth,
  }));

  return (
    <div className="fixed right-4 top-20 bottom-24 w-[500px] bg-background border rounded-lg shadow-lg flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Performance Metrics</h3>
        <Button
          onClick={() => setShowMetricsDashboard(false)}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Charts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Requests Per Second */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-2">Requests/Second</h4>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rpsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                fontSize={10} 
                tickFormatter={(value) => `${value}s`}
              />
              <YAxis fontSize={10} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(value) => `Time: ${value}s`}
                formatter={(value: number) => value.toFixed(1)}
              />
              <Area
                type="monotone"
                dataKey="rps"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#rpsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Average Latency */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-2">Average Latency (ms)</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                fontSize={10} 
                tickFormatter={(value) => `${value}s`}
              />
              <YAxis fontSize={10} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(value) => `Time: ${value}s`}
                formatter={(value: number) => `${value.toFixed(2)}ms`}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Error Rate */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-2">Error Rate (%)</h4>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                fontSize={10} 
                tickFormatter={(value) => `${value}s`}
              />
              <YAxis fontSize={10} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(value) => `Time: ${value}s`}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#errorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Active Requests & Queue Depth */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-2">Active Requests & Queue Depth</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                fontSize={10} 
                tickFormatter={(value) => `${value}s`}
              />
              <YAxis fontSize={10} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(value) => `Time: ${value}s`}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="activeRequests"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="Active"
              />
              <Line
                type="monotone"
                dataKey="queueDepth"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Queue"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Current Metrics Summary */}
        {state.metrics && (
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3">Current Metrics</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Total Requests</div>
                <div className="font-semibold">{state.metrics.totalRequests}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Success Rate</div>
                <div className="font-semibold text-green-600">
                  {((1 - state.metrics.errorRate) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Latency</div>
                <div className="font-semibold">{state.metrics.averageLatency.toFixed(2)}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground">Scaling Actions</div>
                <div className="font-semibold">{state.metrics.scalingActions}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

