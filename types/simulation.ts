import { SystemNode, SystemEdge } from './index';

// Simulation State
export enum SimulationStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
}

// Simulation Configuration
export interface SimulationConfig {
  // System Inputs
  requestsPerSecond: number;
  concurrentUsers: number;
  payloadSize: number; // in KB
  errorRate: number; // 0.0 to 1.0
  messageQueueDepth: number;
  cacheHitRatio: number; // 0.0 to 1.0
  dbLatency: number; // ms
  serviceCpuCost: number; // ms per request
  
  // Network Latency Matrix (ms)
  network: Record<string, number>;
  
  // Environment Controls
  autoScaling: boolean;
  failureInjection: boolean;
  consistencyMode: 'strong' | 'eventual';
  chaosMode: boolean;
  
  // Simulation Settings
  duration: number; // seconds
  tickRate: number; // ms per tick (default 100ms)
}

// Default configuration
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  requestsPerSecond: 100,
  concurrentUsers: 50,
  payloadSize: 10,
  errorRate: 0.01,
  messageQueueDepth: 100,
  cacheHitRatio: 0.85,
  dbLatency: 40,
  serviceCpuCost: 8,
  network: {
    'Client→Gateway': 10,
    'Gateway→Service': 8,
    'Service→DB': 12,
    'Service→Cache': 5,
    'Service→Queue': 7,
  },
  autoScaling: true,
  failureInjection: false,
  consistencyMode: 'eventual',
  chaosMode: false,
  duration: 30,
  tickRate: 100,
};

// Simulation Events
export enum SimulationEventType {
  REQUEST_SENT = 'request_sent',
  REQUEST_RECEIVED = 'request_received',
  REQUEST_PROCESSED = 'request_processed',
  REQUEST_FAILED = 'request_failed',
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  DB_QUERY = 'db_query',
  QUEUE_ENQUEUE = 'queue_enqueue',
  QUEUE_DEQUEUE = 'queue_dequeue',
  NODE_OVERLOAD = 'node_overload',
  NODE_SCALED = 'node_scaled',
  NODE_FAILURE = 'node_failure',
  NODE_RECOVERY = 'node_recovery',
  BACKLOG_WARNING = 'backlog_warning',
  BACKLOG_CLEARED = 'backlog_cleared',
}

export interface SimulationEvent {
  id: string;
  type: SimulationEventType;
  timestamp: number; // ms since simulation start
  nodeId?: string;
  sourcePath?: string[];
  targetPath?: string[];
  message: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

// Active Request in the system
export interface ActiveRequest {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  path: string[]; // node IDs traversed
  startTime: number;
  currentLatency: number;
  payload: number; // KB
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 1
}

// Node Metrics
export interface NodeMetrics {
  nodeId: string;
  requestsPerSecond: number;
  averageLatency: number;
  successRate: number;
  errorRate: number;
  queueDepth: number;
  cpuUtilization: number;
  instances: number; // for auto-scaling
  throughput: number; // requests processed
  cacheHitRate?: number; // for cache nodes
  queryRate?: number; // for DB nodes
}

// Edge Metrics
export interface EdgeMetrics {
  edgeId: string;
  throughput: number; // requests per second
  bandwidth: number; // KB/s
  latency: number; // ms
  packetLoss: number; // 0.0 to 1.0
}

// System-wide Metrics
export interface SystemMetrics {
  timestamp: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  requestsPerSecond: number;
  errorRate: number;
  totalQueueDepth: number;
  activeRequests: number;
  scalingActions: number;
}

// Metrics History (for charting)
export interface MetricsSnapshot {
  timestamp: number;
  system: SystemMetrics;
  nodes: Map<string, NodeMetrics>;
  edges: Map<string, EdgeMetrics>;
}

// Simulation Result
export interface SimulationResult {
  config: SimulationConfig;
  duration: number;
  metricsHistory: MetricsSnapshot[];
  events: SimulationEvent[];
  summary: {
    totalRequests: number;
    successRate: number;
    averageLatency: number;
    peakRPS: number;
    bottlenecks: BottleneckAnalysis[];
    recommendations: string[];
  };
}

// Bottleneck Analysis
export interface BottleneckAnalysis {
  nodeId: string;
  nodeName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  metrics: {
    avgLatency: number;
    maxQueueDepth: number;
    errorRate: number;
    cpuUtilization: number;
  };
  recommendations: string[];
}

// Simulation State
export interface SimulationState {
  status: SimulationStatus;
  config: SimulationConfig;
  currentTime: number; // ms since start
  activeRequests: ActiveRequest[];
  nodeMetrics: Map<string, NodeMetrics>;
  edgeMetrics: Map<string, EdgeMetrics>;
  systemMetrics: SystemMetrics;
  events: SimulationEvent[];
  metricsHistory: MetricsSnapshot[];
  speed: number; // 1x, 2x, 4x, 10x
}

// Visualization State
export interface VisualizationState {
  animatedRequests: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    progress: number;
    color: string;
  }>;
  nodeHighlights: Map<string, {
    intensity: number; // 0 to 1
    color: string;
    pulse: boolean;
  }>;
  edgeHighlights: Map<string, {
    thickness: number;
    animated: boolean;
  }>;
  heatmapEnabled: boolean;
}

// Configuration Preset
export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  config: SimulationConfig;
  tags: string[];
}

