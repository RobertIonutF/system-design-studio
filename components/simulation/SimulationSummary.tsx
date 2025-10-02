'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimulationStore } from '@/stores/simulation-store';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  Download,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SimulationSummary() {
  const { showSummary, result, setShowSummary } = useSimulationStore();

  if (!showSummary || !result) return null;

  const { summary, duration, config } = result;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleExportResults = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `simulation-result-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog 
      open={showSummary} 
      onOpenChange={(open) => {
        // Allow closing the modal
        if (!open) {
          setShowSummary(false);
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[90vh]" onEscapeKeyDown={() => setShowSummary(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Simulation Results
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Requests</span>
                </div>
                <div className="text-2xl font-bold">{summary.totalRequests.toLocaleString()}</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Success Rate</span>
                </div>
                <div className={cn(
                  "text-2xl font-bold",
                  summary.successRate >= 0.99 ? "text-green-600" :
                  summary.successRate >= 0.95 ? "text-yellow-600" : "text-red-600"
                )}>
                  {(summary.successRate * 100).toFixed(1)}%
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Avg Latency</span>
                </div>
                <div className="text-2xl font-bold">{summary.averageLatency.toFixed(1)}ms</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Peak RPS</span>
                </div>
                <div className="text-2xl font-bold">{summary.peakRPS.toFixed(0)}</div>
              </Card>
            </div>

            {/* Configuration Used */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Configuration</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{duration.toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">RPS Target:</span>
                  <span className="ml-2 font-medium">{config.requestsPerSecond}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Error Rate:</span>
                  <span className="ml-2 font-medium">{(config.errorRate * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cache Hit Ratio:</span>
                  <span className="ml-2 font-medium">{(config.cacheHitRatio * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DB Latency:</span>
                  <span className="ml-2 font-medium">{config.dbLatency}ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto-Scaling:</span>
                  <span className="ml-2 font-medium">{config.autoScaling ? 'On' : 'Off'}</span>
                </div>
              </div>
            </Card>

            {/* Bottlenecks */}
            {summary.bottlenecks.length > 0 ? (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Bottleneck Analysis
                </h3>
                <div className="space-y-3">
                  {summary.bottlenecks.map((bottleneck) => (
                    <div
                      key={bottleneck.nodeId}
                      className={cn(
                        "p-4 border-2 rounded-lg",
                        getSeverityColor(bottleneck.severity)
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(bottleneck.severity)}
                          <div>
                            <h4 className="font-semibold">{bottleneck.nodeName}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {bottleneck.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Issues:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          {bottleneck.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Avg Latency:</span>
                          <span className="ml-1 font-medium">{bottleneck.metrics.avgLatency.toFixed(2)}ms</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CPU:</span>
                          <span className="ml-1 font-medium">{(bottleneck.metrics.cpuUtilization * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Queue Depth:</span>
                          <span className="ml-1 font-medium">{bottleneck.metrics.maxQueueDepth}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Error Rate:</span>
                          <span className="ml-1 font-medium">{(bottleneck.metrics.errorRate * 100).toFixed(2)}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Recommendations:</p>
                        <ul className="text-sm space-y-1">
                          {bottleneck.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    No bottlenecks detected! Your system is performing well.
                  </p>
                </div>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">System Recommendations</h3>
              <ul className="space-y-2">
                {summary.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button onClick={handleExportResults} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button onClick={() => setShowSummary(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

