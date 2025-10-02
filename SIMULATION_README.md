# Simulation Engine & Sandbox Mode

## Overview

The Simulation Engine transforms the System Design Studio from a static visual editor into an interactive runtime simulator. It allows users to visualize how requests, messages, and data flow through their architecture in real-time, complete with metrics, logs, and bottleneck analysis.

## Features

### 🎮 Simulation Control Panel
- **Start/Pause/Resume/Stop** controls for simulation lifecycle
- **Speed control** (1x, 2x, 4x, 10x) for faster testing
- **Real-time metrics** display (RPS, latency, success rate, active requests)
- **Reset** functionality to start fresh
- **View Results** button to access past simulation results

### ⚙️ Configuration Modal
Three tabs for comprehensive configuration:

#### 1. Presets Tab
- **Pre-configured scenarios**:
  - Low Traffic (10 RPS, 20s duration)
  - Moderate Load (100 RPS, 30s duration)
  - High Traffic (1000 RPS, 60s duration)
  - Chaos Mode (500 RPS, failures enabled, 45s duration)
- **Save custom presets** with name, description, and tags
- **Quick preset switching** with one click

#### 2. System Inputs Tab
Configurable parameters with sliders and numeric inputs:
- **Requests Per Second** (1-10,000)
- **Concurrent Users** (1-10,000)
- **Payload Size** (1-1,000 KB)
- **Error Rate** (0-50%)
- **Message Queue Depth** (10-10,000)
- **Cache Hit Ratio** (0-100%)
- **DB Latency** (1-1,000ms)
- **Service CPU Cost** (1-1,000ms)
- **Simulation Duration** (5-300 seconds)

#### 3. Environment Tab
Toggle features for realistic scenarios:
- **Auto-Scaling**: Automatically scale services based on CPU load
- **Failure Injection**: Simulate random node failures
- **Chaos Mode**: Random latency spikes and packet drops
- **Consistency Mode**: Choose between Strong or Eventual consistency

### 📊 Metrics Dashboard
Real-time charts powered by Recharts:
- **Requests/Second**: Area chart showing throughput over time
- **Average Latency**: Line chart tracking response times
- **Error Rate**: Area chart monitoring failures
- **Active Requests & Queue Depth**: Dual-line chart for system load
- **Current Metrics Summary**: Grid showing key performance indicators

### 📝 Log Console
Interactive event log with filtering:
- **Real-time event streaming** with timestamps
- **Color-coded severity** (info, success, warning, error)
- **Filter options**:
  - All events
  - Errors only
  - Performance events (cache hits/misses, DB queries, backlogs)
  - Scaling actions
- **Auto-scroll** to latest events
- **Event count** display

### 📈 Simulation Summary
Post-simulation analysis screen featuring:

#### Performance Overview
- Total requests processed
- Success rate (color-coded by performance)
- Average latency
- Peak RPS achieved

#### Configuration Used
- Displays all parameters from the simulation run
- Helps reproduce results

#### Bottleneck Analysis
- **Severity-based classification**: Low, Medium, High, Critical
- **Issue identification**: Specific problems detected
- **Metrics per node**: Latency, CPU, queue depth, error rate
- **Recommendations**: Actionable suggestions for improvement

#### System Recommendations
- General advice for system improvement
- Based on detected patterns and missing components
- Examples:
  - "Consider adding a cache layer to reduce database load"
  - "Add a load balancer to distribute traffic evenly"

### 💾 Export & Persistence
- **Export Results**: Download simulation data as JSON
- **Preset Management**: Save and load configuration presets
- Results include full metrics history and event log

## Architecture

### Core Components

#### Simulation Engine (`core/simulator.ts`)
- **Discrete event simulation** with tick-based processing (100ms default)
- **Event bus** for pub/sub pattern
- **Metrics collection** at node, edge, and system levels
- **Request routing** through the node graph
- **Auto-scaling logic** for service nodes
- **Bottleneck analysis** with severity classification

#### Simulation Store (`stores/simulation-store.ts`)
- Zustand-based state management
- Manages engine lifecycle
- Handles UI state (modals, panels)
- Preset management
- Event and metrics aggregation

#### Type System (`types/simulation.ts`)
Comprehensive TypeScript types:
- `SimulationConfig`: All configuration parameters
- `SimulationState`: Runtime state
- `SimulationEvent`: Event log entries
- `NodeMetrics`, `EdgeMetrics`, `SystemMetrics`: Performance data
- `SimulationResult`: Final analysis output
- `BottleneckAnalysis`: Detected issues and recommendations

### Simulation Flow

```
1. User configures simulation parameters
   ↓
2. Click "Start" → Initialize SimulationEngine
   ↓
3. Engine processes in ticks (100ms intervals):
   - Generate requests from client nodes
   - Route requests through graph
   - Apply latencies and processing times
   - Handle node-specific logic (cache, DB, queue)
   - Check for errors
   - Apply auto-scaling if enabled
   - Collect metrics
   ↓
4. Events emitted in real-time → Log Console
   ↓
5. Metrics updated → Metrics Dashboard
   ↓
6. Simulation completes → Summary Modal
```

### Node-Specific Behaviors

- **Client**: Generates requests at configured RPS
- **API Gateway/Load Balancer**: Routes requests (10ms latency)
- **Service**: Processes with CPU cost, scales based on utilization
- **Cache**: Hit/miss logic based on hit ratio (2ms latency)
- **Database**: Query execution with configured latency
- **Queue**: Enqueue/dequeue with depth monitoring
- **CDN**: Fast content delivery (minimal latency)

### Auto-Scaling Logic
- Monitors CPU utilization per service node
- **Scale up** when CPU > 80% (max 10 instances)
- **Scale down** when CPU < 30% (min 1 instance)
- Redistributes load across instances
- Logs all scaling actions

## Usage Guide

### Basic Simulation

1. **Design your system** on the canvas
   - Add nodes (Client, Services, Database, Cache, etc.)
   - Connect them with edges

2. **Open Configuration**
   - Click the Settings (⚙️) button in the control panel
   - Choose a preset or customize parameters

3. **Start Simulation**
   - Click "Start" button
   - Watch real-time visualization, logs, and metrics

4. **Analyze Results**
   - Review metrics dashboard during simulation
   - Check log console for events
   - View summary when simulation completes

### Advanced Techniques

#### Testing Scalability
```
1. Use "High Traffic" preset (1000 RPS)
2. Enable Auto-Scaling
3. Monitor scaling actions in log console
4. Check if services handle load or bottleneck
```

#### Testing Resilience
```
1. Enable Chaos Mode
2. Enable Failure Injection
3. Set higher error rate (5-10%)
4. Observe system recovery in logs
```

#### Cache Optimization
```
1. Start with low cache hit ratio (50%)
2. Run simulation, note DB load
3. Increase cache hit ratio (85%)
4. Compare DB query rates in summary
```

#### Bottleneck Identification
```
1. Run simulation with moderate load
2. Review Bottleneck Analysis in summary
3. Check which nodes are overloaded
4. Follow recommendations to improve design
```

## Performance Characteristics

- **Tick Rate**: 100ms (configurable)
- **Speed Multipliers**: 1x, 2x, 4x, 10x
- **Max RPS**: 10,000
- **Max Duration**: 300 seconds (5 minutes)
- **Metrics Snapshots**: Every 1 second
- **Event Log**: Unlimited (until simulation end)

## Troubleshooting

### Issue: No requests being generated
- **Cause**: No Client nodes in design
- **Solution**: Add at least one Client node

### Issue: Simulation completes instantly
- **Cause**: No edges connecting nodes
- **Solution**: Connect nodes with edges

### Issue: High error rate
- **Cause**: Configured error rate or system overload
- **Solution**: Lower error rate or add more capacity

### Issue: Summary modal won't close
- **Fix Applied**: Press ESC or click overlay to close
- Can now stop simulation even if summary is open
- "View Results" button available to re-open summary

## Future Enhancements

### Planned Features
- [ ] Animated request particles flowing through edges
- [ ] Node highlighting based on load (heatmap)
- [ ] Edge thickness visualization for bandwidth
- [ ] Stress test mode (gradually increasing load)
- [ ] Challenge mode (score based on resilience)
- [ ] AI-powered optimization suggestions
- [ ] Comparison mode (compare multiple simulation runs)
- [ ] Advanced failure scenarios (network partitions, cascading failures)

## Technical Notes

### Dependencies
- **Recharts**: Chart rendering
- **Zustand**: State management
- **@xyflow/react**: Node graph rendering
- **Lucide React**: Icons

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Considerations
- Simulations run in browser (client-side)
- Large graphs (>50 nodes) may impact performance
- High RPS (>1000) best tested at higher speeds (4x-10x)
- Metrics history stored in memory during simulation

## API Reference

### SimulationEngine

```typescript
// Initialize
const engine = new SimulationEngine(nodes, edges, config);

// Control
engine.start();
engine.pause();
engine.resume();
engine.stop();
engine.setSpeed(2); // 2x speed

// Listen to events
const unsubscribe = engine.onEvent((event) => {
  console.log(event.message);
});

const unsubMetrics = engine.onMetricsUpdate((metrics) => {
  console.log(`RPS: ${metrics.requestsPerSecond}`);
});

// Get results
const result = engine.getResult();
```

### Simulation Store

```typescript
import { useSimulationStore } from '@/stores/simulation-store';

// In component
const {
  status,
  startSimulation,
  pauseSimulation,
  stopSimulation,
  config,
  updateConfig,
  events,
  metrics,
  result,
} = useSimulationStore();
```

## Contributing

To add new features:

1. **New Node Behaviors**: Extend `handleNodeProcessing()` in `simulator.ts`
2. **New Metrics**: Add to `NodeMetrics` type and collection logic
3. **New Presets**: Add to `presets` array in `simulation-store.ts`
4. **New Visualizations**: Create components in `components/simulation/`

## License

Part of the System Design Practice Studio project.

