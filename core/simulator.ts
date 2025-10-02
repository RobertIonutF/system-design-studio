import { SystemNode, SystemEdge, NodeType } from '@/types';
import {
  SimulationConfig,
  SimulationState,
  SimulationStatus,
  SimulationEvent,
  SimulationEventType,
  ActiveRequest,
  NodeMetrics,
  EdgeMetrics,
  SystemMetrics,
  MetricsSnapshot,
  SimulationResult,
  BottleneckAnalysis,
} from '@/types/simulation';

// Event Bus for pub/sub pattern
export type SimulationEventListener = (event: SimulationEvent) => void;
export type MetricsUpdateListener = (metrics: SystemMetrics) => void;

export class SimulationEngine {
  private state: SimulationState;
  private nodes: SystemNode[];
  private edges: SystemEdge[];
  private eventListeners: Set<SimulationEventListener> = new Set();
  private metricsListeners: Set<MetricsUpdateListener> = new Set();
  private intervalId: number | null = null;
  private requestIdCounter = 0;
  private eventIdCounter = 0;

  constructor(nodes: SystemNode[], edges: SystemEdge[], config: SimulationConfig) {
    this.nodes = nodes;
    this.edges = edges;
    this.state = this.initializeState(config);
  }

  private initializeState(config: SimulationConfig): SimulationState {
    const nodeMetrics = new Map<string, NodeMetrics>();
    
    // Initialize metrics for each node
    this.nodes.forEach(node => {
      nodeMetrics.set(node.id, {
        nodeId: node.id,
        requestsPerSecond: 0,
        averageLatency: 0,
        successRate: 1.0,
        errorRate: 0,
        queueDepth: 0,
        cpuUtilization: 0,
        instances: 1,
        throughput: 0,
        cacheHitRate: node.data.type === NodeType.CACHE ? config.cacheHitRatio : undefined,
        queryRate: node.data.type === NodeType.DATABASE ? 0 : undefined,
      });
    });

    return {
      status: SimulationStatus.IDLE,
      config,
      currentTime: 0,
      activeRequests: [],
      nodeMetrics,
      edgeMetrics: new Map(),
      systemMetrics: this.createEmptySystemMetrics(),
      events: [],
      metricsHistory: [],
      speed: 1,
    };
  }

  private createEmptySystemMetrics(): SystemMetrics {
    return {
      timestamp: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      totalQueueDepth: 0,
      activeRequests: 0,
      scalingActions: 0,
    };
  }

  // Event Bus Methods
  public onEvent(listener: SimulationEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public onMetricsUpdate(listener: MetricsUpdateListener): () => void {
    this.metricsListeners.add(listener);
    return () => this.metricsListeners.delete(listener);
  }

  private emitEvent(event: SimulationEvent): void {
    this.state.events.push(event);
    this.eventListeners.forEach(listener => listener(event));
  }

  private emitMetrics(): void {
    this.metricsListeners.forEach(listener => listener(this.state.systemMetrics));
  }

  // Simulation Control Methods
  public start(): void {
    if (this.state.status === SimulationStatus.RUNNING) return;

    this.state.status = SimulationStatus.RUNNING;
    this.emitEvent({
      id: this.generateEventId(),
      type: SimulationEventType.REQUEST_SENT,
      timestamp: this.state.currentTime,
      message: 'Simulation started',
      severity: 'info',
    });

    this.runSimulationLoop();
  }

  public pause(): void {
    if (this.state.status !== SimulationStatus.RUNNING) return;
    
    this.state.status = SimulationStatus.PAUSED;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.emitEvent({
      id: this.generateEventId(),
      type: SimulationEventType.REQUEST_SENT,
      timestamp: this.state.currentTime,
      message: 'Simulation paused',
      severity: 'info',
    });
  }

  public resume(): void {
    if (this.state.status !== SimulationStatus.PAUSED) return;
    
    this.state.status = SimulationStatus.RUNNING;
    this.emitEvent({
      id: this.generateEventId(),
      type: SimulationEventType.REQUEST_SENT,
      timestamp: this.state.currentTime,
      message: 'Simulation resumed',
      severity: 'info',
    });
    
    this.runSimulationLoop();
  }

  public stop(): void {
    this.state.status = SimulationStatus.STOPPED;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.emitEvent({
      id: this.generateEventId(),
      type: SimulationEventType.REQUEST_SENT,
      timestamp: this.state.currentTime,
      message: 'Simulation stopped',
      severity: 'info',
    });
  }

  public setSpeed(speed: number): void {
    const wasRunning = this.state.status === SimulationStatus.RUNNING;
    if (wasRunning) this.pause();
    
    this.state.speed = speed;
    
    if (wasRunning) this.resume();
  }

  // Core Simulation Loop
  private runSimulationLoop(): void {
    const actualTickRate = this.state.config.tickRate / this.state.speed;
    
    this.intervalId = window.setInterval(() => {
      if (this.state.status !== SimulationStatus.RUNNING) return;

      this.tick();

      // Check if simulation should complete
      const durationMs = this.state.config.duration * 1000;
      if (this.state.currentTime >= durationMs) {
        this.complete();
      }
    }, actualTickRate);
  }

  private tick(): void {
    const deltaTime = this.state.config.tickRate;
    this.state.currentTime += deltaTime;

    // Generate new requests from client nodes
    this.generateRequests();

    // Process active requests
    this.processRequests(deltaTime);

    // Update metrics
    this.updateMetrics();

    // Check for auto-scaling
    if (this.state.config.autoScaling) {
      this.checkAutoScaling();
    }

    // Chaos mode effects
    if (this.state.config.chaosMode) {
      this.applyChaosEffects();
    }

    // Take metrics snapshot every second
    if (this.state.currentTime % 1000 === 0) {
      this.takeMetricsSnapshot();
    }

    this.emitMetrics();
  }

  private generateRequests(): void {
    const clientNodes = this.nodes.filter(n => n.data.type === NodeType.CLIENT);
    if (clientNodes.length === 0) return;

    // Calculate requests to generate this tick
    const requestsThisTick = (this.state.config.requestsPerSecond * this.state.config.tickRate) / 1000;
    const requestsToGenerate = Math.floor(requestsThisTick + Math.random());

    for (let i = 0; i < requestsToGenerate; i++) {
      const clientNode = clientNodes[Math.floor(Math.random() * clientNodes.length)];
      const targetEdges = this.edges.filter(e => e.source === clientNode.id);
      
      if (targetEdges.length === 0) continue;

      const targetEdge = targetEdges[Math.floor(Math.random() * targetEdges.length)];
      const targetNodeId = targetEdge.target;

      const request: ActiveRequest = {
        id: this.generateRequestId(),
        sourceNodeId: clientNode.id,
        targetNodeId,
        path: [clientNode.id],
        startTime: this.state.currentTime,
        currentLatency: 0,
        payload: this.state.config.payloadSize,
        status: 'pending',
        progress: 0,
      };

      this.state.activeRequests.push(request);
      this.state.systemMetrics.totalRequests++;

      this.emitEvent({
        id: this.generateEventId(),
        type: SimulationEventType.REQUEST_SENT,
        timestamp: this.state.currentTime,
        nodeId: clientNode.id,
        sourcePath: [clientNode.id],
        targetPath: [targetNodeId],
        message: `Request ${request.id} sent from ${clientNode.data.label} to ${this.getNodeById(targetNodeId)?.data.label}`,
        severity: 'info',
      });
    }
  }

  private processRequests(deltaTime: number): void {
    const completedRequests: string[] = [];

    this.state.activeRequests.forEach(request => {
      if (request.status === 'completed' || request.status === 'failed') {
        completedRequests.push(request.id);
        return;
      }

      const targetNode = this.getNodeById(request.targetNodeId);
      if (!targetNode) {
        request.status = 'failed';
        this.state.systemMetrics.failedRequests++;
        return;
      }

      // Calculate latency for this hop
      const networkLatency = this.getNetworkLatency(request.path[request.path.length - 1], request.targetNodeId);
      const processingLatency = this.getProcessingLatency(targetNode);
      const totalLatency = networkLatency + processingLatency;

      // Update request progress
      request.currentLatency += deltaTime;
      request.progress = Math.min(request.currentLatency / totalLatency, 1);

      // Check if request is completed at current node
      if (request.progress >= 1) {
        request.path.push(request.targetNodeId);
        
        // Check for errors
        if (Math.random() < this.state.config.errorRate) {
          request.status = 'failed';
          this.state.systemMetrics.failedRequests++;
          
          this.emitEvent({
            id: this.generateEventId(),
            type: SimulationEventType.REQUEST_FAILED,
            timestamp: this.state.currentTime,
            nodeId: targetNode.id,
            sourcePath: request.path,
            message: `Request ${request.id} failed at ${targetNode.data.label}`,
            severity: 'error',
          });
          return;
        }

        // Handle node-specific logic
        this.handleNodeProcessing(targetNode, request);

        // Find next hop
        const nextHop = this.findNextHop(targetNode.id, request);
        if (nextHop) {
          request.targetNodeId = nextHop;
          request.currentLatency = 0;
          request.progress = 0;
          request.status = 'processing';
          
          this.emitEvent({
            id: this.generateEventId(),
            type: SimulationEventType.REQUEST_PROCESSED,
            timestamp: this.state.currentTime,
            nodeId: targetNode.id,
            sourcePath: request.path,
            targetPath: [nextHop],
            message: `Request ${request.id} processed by ${targetNode.data.label}, forwarding to ${this.getNodeById(nextHop)?.data.label}`,
            severity: 'info',
          });
        } else {
          // Request completed
          request.status = 'completed';
          this.state.systemMetrics.successfulRequests++;
          
          const totalLatency = this.state.currentTime - request.startTime;
          this.updateLatencyMetrics(totalLatency);
          
          this.emitEvent({
            id: this.generateEventId(),
            type: SimulationEventType.REQUEST_PROCESSED,
            timestamp: this.state.currentTime,
            nodeId: targetNode.id,
            sourcePath: request.path,
            message: `Request ${request.id} completed (latency: ${totalLatency.toFixed(2)}ms)`,
            severity: 'success',
          });
        }
      }
    });

    // Remove completed requests
    this.state.activeRequests = this.state.activeRequests.filter(r => !completedRequests.includes(r.id));
  }

  private handleNodeProcessing(node: SystemNode, request: ActiveRequest): void {
    const metrics = this.state.nodeMetrics.get(node.id);
    if (!metrics) return;

    metrics.throughput++;

    switch (node.data.type) {
      case NodeType.CACHE:
        if (Math.random() < this.state.config.cacheHitRatio) {
          this.emitEvent({
            id: this.generateEventId(),
            type: SimulationEventType.CACHE_HIT,
            timestamp: this.state.currentTime,
            nodeId: node.id,
            message: `Cache hit for request ${request.id}`,
            severity: 'success',
          });
        } else {
          this.emitEvent({
            id: this.generateEventId(),
            type: SimulationEventType.CACHE_MISS,
            timestamp: this.state.currentTime,
            nodeId: node.id,
            message: `Cache miss for request ${request.id}, forwarding to backend`,
            severity: 'warning',
          });
        }
        break;

      case NodeType.DATABASE:
        metrics.queryRate = (metrics.queryRate || 0) + 1;
        this.emitEvent({
          id: this.generateEventId(),
          type: SimulationEventType.DB_QUERY,
          timestamp: this.state.currentTime,
          nodeId: node.id,
          message: `DB query for request ${request.id} (latency: ${this.state.config.dbLatency}ms)`,
          severity: 'info',
        });
        break;

      case NodeType.QUEUE:
        metrics.queueDepth++;
        this.emitEvent({
          id: this.generateEventId(),
          type: SimulationEventType.QUEUE_ENQUEUE,
          timestamp: this.state.currentTime,
          nodeId: node.id,
          message: `Message enqueued (depth: ${metrics.queueDepth})`,
          severity: 'info',
        });

        if (metrics.queueDepth > this.state.config.messageQueueDepth * 0.8) {
          this.emitEvent({
            id: this.generateEventId(),
            type: SimulationEventType.BACKLOG_WARNING,
            timestamp: this.state.currentTime,
            nodeId: node.id,
            message: `Queue backlog warning: ${metrics.queueDepth}/${this.state.config.messageQueueDepth}`,
            severity: 'warning',
          });
        }
        break;
    }

    // Update node load
    metrics.requestsPerSecond = metrics.throughput / (this.state.currentTime / 1000);
    metrics.cpuUtilization = Math.min((metrics.requestsPerSecond / 100) * metrics.instances, 1);
  }

  private findNextHop(currentNodeId: string, request: ActiveRequest): string | null {
    const outgoingEdges = this.edges.filter(e => e.source === currentNodeId);
    
    // Avoid cycles
    const unvisitedEdges = outgoingEdges.filter(e => !request.path.includes(e.target));
    
    if (unvisitedEdges.length === 0) return null;

    // Simple routing: pick the first unvisited neighbor
    return unvisitedEdges[0].target;
  }

  private getNetworkLatency(sourceId: string, targetId: string): number {
    const sourceNode = this.getNodeById(sourceId);
    const targetNode = this.getNodeById(targetId);
    
    if (!sourceNode || !targetNode) return 10;

    const key = `${sourceNode.data.type}→${targetNode.data.type}`;
    return this.state.config.network[key] || 10;
  }

  private getProcessingLatency(node: SystemNode): number {
    switch (node.data.type) {
      case NodeType.DATABASE:
        return this.state.config.dbLatency;
      case NodeType.CACHE:
        return 2;
      case NodeType.QUEUE:
        return 5;
      case NodeType.SERVICE:
        return this.state.config.serviceCpuCost;
      default:
        return 5;
    }
  }

  private updateMetrics(): void {
    this.state.systemMetrics.timestamp = this.state.currentTime;
    this.state.systemMetrics.activeRequests = this.state.activeRequests.length;
    this.state.systemMetrics.requestsPerSecond = 
      this.state.systemMetrics.totalRequests / (this.state.currentTime / 1000);
    
    if (this.state.systemMetrics.totalRequests > 0) {
      this.state.systemMetrics.errorRate = 
        this.state.systemMetrics.failedRequests / this.state.systemMetrics.totalRequests;
    }

    let totalQueueDepth = 0;
    this.state.nodeMetrics.forEach(metrics => {
      totalQueueDepth += metrics.queueDepth;
      
      if (metrics.throughput > 0) {
        metrics.successRate = 1 - metrics.errorRate;
      }
    });
    
    this.state.systemMetrics.totalQueueDepth = totalQueueDepth;
  }

  private updateLatencyMetrics(latency: number): void {
    const count = this.state.systemMetrics.successfulRequests;
    const currentAvg = this.state.systemMetrics.averageLatency;
    this.state.systemMetrics.averageLatency = (currentAvg * (count - 1) + latency) / count;
  }

  private checkAutoScaling(): void {
    this.state.nodeMetrics.forEach((metrics, nodeId) => {
      const node = this.getNodeById(nodeId);
      if (!node || node.data.type !== NodeType.SERVICE) return;

      // Scale up if CPU > 80%
      if (metrics.cpuUtilization > 0.8 && metrics.instances < 10) {
        metrics.instances++;
        this.state.systemMetrics.scalingActions++;
        
        this.emitEvent({
          id: this.generateEventId(),
          type: SimulationEventType.NODE_SCALED,
          timestamp: this.state.currentTime,
          nodeId,
          message: `Auto-scaled ${node.data.label}: +1 instance (total: ${metrics.instances}, load: ${(metrics.cpuUtilization * 100).toFixed(1)}% → ${((metrics.cpuUtilization * 0.8) * 100).toFixed(1)}%)`,
          severity: 'success',
        });
        
        metrics.cpuUtilization *= 0.8; // Redistribute load
      }

      // Scale down if CPU < 30%
      if (metrics.cpuUtilization < 0.3 && metrics.instances > 1) {
        metrics.instances--;
        this.state.systemMetrics.scalingActions++;
        
        this.emitEvent({
          id: this.generateEventId(),
          type: SimulationEventType.NODE_SCALED,
          timestamp: this.state.currentTime,
          nodeId,
          message: `Auto-scaled ${node.data.label}: -1 instance (total: ${metrics.instances})`,
          severity: 'info',
        });
        
        metrics.cpuUtilization *= 1.2; // Redistribute load
      }
    });
  }

  private applyChaosEffects(): void {
    // Random latency spikes
    if (Math.random() < 0.05) {
      const nodeId = this.nodes[Math.floor(Math.random() * this.nodes.length)].id;
      this.emitEvent({
        id: this.generateEventId(),
        type: SimulationEventType.NODE_OVERLOAD,
        timestamp: this.state.currentTime,
        nodeId,
        message: `Chaos: Latency spike detected!`,
        severity: 'warning',
      });
    }
  }

  private takeMetricsSnapshot(): void {
    const snapshot: MetricsSnapshot = {
      timestamp: this.state.currentTime,
      system: { ...this.state.systemMetrics },
      nodes: new Map(this.state.nodeMetrics),
      edges: new Map(this.state.edgeMetrics),
    };
    this.state.metricsHistory.push(snapshot);
  }

  private complete(): void {
    // Only complete once
    if (this.state.status === SimulationStatus.COMPLETED) return;
    
    this.stop();
    this.state.status = SimulationStatus.COMPLETED;
    
    this.emitEvent({
      id: this.generateEventId(),
      type: SimulationEventType.REQUEST_SENT,
      timestamp: this.state.currentTime,
      message: `Simulation completed (${this.state.systemMetrics.totalRequests} requests processed)`,
      severity: 'success',
    });
  }

  // Analysis Methods
  public analyzeBottlenecks(): BottleneckAnalysis[] {
    const bottlenecks: BottleneckAnalysis[] = [];

    this.state.nodeMetrics.forEach((metrics, nodeId) => {
      const node = this.getNodeById(nodeId);
      if (!node) return;

      const issues: string[] = [];
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const recommendations: string[] = [];

      if (metrics.cpuUtilization > 0.9) {
        issues.push('CPU utilization critically high');
        severity = 'critical';
        recommendations.push('Add more instances or horizontal scaling');
      } else if (metrics.cpuUtilization > 0.7) {
        issues.push('CPU utilization high');
        severity = severity === 'low' ? 'medium' : severity;
        recommendations.push('Consider adding auto-scaling');
      }

      if (metrics.queueDepth > this.state.config.messageQueueDepth * 0.8) {
        issues.push('Queue depth near capacity');
        severity = 'high';
        recommendations.push('Increase queue capacity or add more workers');
      }

      if (metrics.errorRate > 0.1) {
        issues.push('High error rate detected');
        severity = 'critical';
        recommendations.push('Investigate error sources and add retry logic');
      }

      if (issues.length > 0) {
        bottlenecks.push({
          nodeId,
          nodeName: node.data.label,
          severity,
          issues,
          metrics: {
            avgLatency: metrics.averageLatency,
            maxQueueDepth: metrics.queueDepth,
            errorRate: metrics.errorRate,
            cpuUtilization: metrics.cpuUtilization,
          },
          recommendations,
        });
      }
    });

    return bottlenecks.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  public getResult(): SimulationResult {
    const bottlenecks = this.analyzeBottlenecks();
    const peakRPS = Math.max(...this.state.metricsHistory.map(s => s.system.requestsPerSecond));

    return {
      config: this.state.config,
      duration: this.state.currentTime / 1000,
      metricsHistory: this.state.metricsHistory,
      events: this.state.events,
      summary: {
        totalRequests: this.state.systemMetrics.totalRequests,
        successRate: this.state.systemMetrics.successfulRequests / this.state.systemMetrics.totalRequests,
        averageLatency: this.state.systemMetrics.averageLatency,
        peakRPS,
        bottlenecks,
        recommendations: this.generateRecommendations(bottlenecks),
      },
    };
  }

  private generateRecommendations(bottlenecks: BottleneckAnalysis[]): string[] {
    const recommendations: string[] = [];

    if (bottlenecks.length === 0) {
      recommendations.push('✅ System is performing well under current load');
    }

    const hasCriticalBottlenecks = bottlenecks.some(b => b.severity === 'critical');
    if (hasCriticalBottlenecks) {
      recommendations.push('🔴 Critical issues detected - immediate action required');
    }

    if (!this.nodes.some(n => n.data.type === NodeType.CACHE)) {
      recommendations.push('💡 Consider adding a cache layer to reduce database load');
    }

    if (!this.nodes.some(n => n.data.type === NodeType.LOAD_BALANCER)) {
      recommendations.push('💡 Add a load balancer to distribute traffic evenly');
    }

    return recommendations;
  }

  // Utility Methods
  private getNodeById(nodeId: string): SystemNode | undefined {
    return this.nodes.find(n => n.id === nodeId);
  }

  private generateRequestId(): string {
    return `req-${this.requestIdCounter++}`;
  }

  private generateEventId(): string {
    return `evt-${this.eventIdCounter++}`;
  }

  public getState(): SimulationState {
    return this.state;
  }

  public getVisualizationData() {
    return {
      activeRequests: this.state.activeRequests,
      nodeMetrics: this.state.nodeMetrics,
      edgeMetrics: this.state.edgeMetrics,
    };
  }
}

