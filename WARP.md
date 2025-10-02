# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

System Design Practice Studio is an interactive web application built with Next.js 15 that helps engineers practice system design through visual diagramming, structured challenges, and real-time simulation. The app features a drag-and-drop interface for creating system architecture diagrams, gamified learning with badges and XP, and an advanced simulation engine for testing designs.

## Development Commands

### Core Development
```powershell
# Start development server with Turbo
npm run dev

# Build for production with Turbo
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Testing & Validation
There are no automated tests currently. Validation happens through:
- Real-time challenge requirement checking
- Drag validation system
- Simulation engine validation

## Architecture Overview

### State Management Architecture
The app uses **Zustand** for state management with three main stores:

1. **Design Store** (`stores/design-store.ts`) - Manages the visual design canvas state including nodes, edges, hierarchical placement, and drag validation
2. **Progress Store** (`stores/progress-store.ts`) - Tracks user progress, XP, badges, and challenge completion with localStorage persistence  
3. **Simulation Store** (`stores/simulation-store.ts`) - Controls the simulation engine, metrics, events, and configuration presets

### Core System Components

#### Visual Architecture Layer
- **DesignCanvas** (`components/DesignCanvas.tsx`) - ReactFlow-based interactive design canvas with drag-and-drop, hierarchical node placement, and advanced keyboard shortcuts
- **SystemNode** (`components/SystemNode.tsx`) - Custom node renderer supporting 12 different node types (Client, API Gateway, Load Balancer, Service, Database, Cache, Queue, Pub/Sub, Object Storage, Metrics, Rate Limiter, CDN)
- **ComponentPalette** - Draggable component library organized by categories (entry, gateway, compute, storage, messaging, observability)

#### Challenge System
- **Challenge Engine** (`data/challenges.ts`) - Structured challenges with requirements validation, scoring, and difficulty progression
- **Validation System** (`lib/validation.ts`) - Real-time design validation against challenge requirements with detailed feedback

#### Simulation Engine (`core/simulator.ts`)
- **Discrete Event Simulation** - Tick-based processing (100ms intervals) with configurable speed multipliers
- **Request Routing** - Simulates requests flowing through the node graph with proper latency modeling
- **Metrics Collection** - Tracks node-level, edge-level, and system-wide performance metrics
- **Auto-scaling Logic** - Dynamic service scaling based on CPU utilization thresholds
- **Bottleneck Analysis** - Automated detection and classification of performance issues

### Node Type System
The app supports 12 system component types defined in `types/index.ts`:
- **CLIENT** - Request generators
- **API_GATEWAY/LOAD_BALANCER** - Traffic routing
- **SERVICE** - Business logic processors with auto-scaling
- **DATABASE** - Data persistence with configurable latency
- **CACHE** - Hit/miss logic with configurable ratios
- **QUEUE/PUBSUB** - Message queuing with depth monitoring
- **OBJECT_STORAGE** - File storage simulation
- **METRICS/RATE_LIMITER/CDN** - Infrastructure components

### Drag & Drop System
Advanced hierarchical placement system (`lib/drag-validation.ts`):
- **Placement Rules** - Components can be placed "in" (inside) or "on" (attached to) other components
- **Connection Validation** - Prevents invalid connections (e.g., Client directly to Database)
- **Keyboard Modifiers** - Ctrl+Drag for duplication, Alt+Drag for auto-connection
- **Visual Feedback** - Real-time validation with hover states and error messages

### Simulation Configuration
Comprehensive simulation parameters (`types/simulation.ts`):
- **System Inputs** - RPS, concurrent users, payload size, error rates
- **Performance Tuning** - Cache hit ratios, DB latency, CPU costs
- **Environment Controls** - Auto-scaling, failure injection, chaos mode
- **Network Modeling** - Latency matrices between component types

## Key Development Patterns

### State Updates
All state changes go through Zustand actions. Never mutate state directly:
```typescript
// Correct
const { addNode, updateConfig } = useDesignStore();
addNode(NodeType.SERVICE, { x: 100, y: 100 });

// Incorrect
designStore.nodes.push(newNode);
```

### Node Operations
Use the design store's hierarchical operations for complex node manipulations:
```typescript
// Place node inside another node
placeNodeInTarget(draggedNodeId, targetNodeId, 'in');

// Validate before operations
const validation = validateNodePlacement(sourceId, targetId);
if (validation.isValid) {
  // Proceed with operation
}
```

### Simulation Lifecycle
The simulation engine follows a strict lifecycle pattern:
```typescript
// Initialize → Start → (Pause/Resume) → Stop → Results
const engine = new SimulationEngine(nodes, edges, config);
engine.start();
// Subscribe to events and metrics
engine.onEvent(handleEvent);
engine.onMetricsUpdate(handleMetrics);
```

### Challenge Validation
Challenges use functional validation patterns:
```typescript
const requirement = {
  id: 'has-cache',
  check: (nodes, edges) => hasNodeType(nodes, NodeType.CACHE),
  points: 20
};
```

## File Structure Logic

### `/components/` - React Components
- UI components follow compound component patterns
- Each system node type has specific rendering logic
- Simulation UI components are modular and reusable

### `/stores/` - State Management
- Each store handles a specific domain (design, progress, simulation)
- Uses Zustand middleware for persistence where needed
- Actions are co-located with state for better organization

### `/types/` - Type Definitions
- `index.ts` - Core domain types (nodes, challenges, user progress)
- `simulation.ts` - Simulation-specific types and configurations
- Strong TypeScript typing throughout prevents runtime errors

### `/data/` - Static Data
- `challenges.ts` - Challenge definitions with validation rules
- `components.ts` - Component metadata and placement rules
- `badges.ts` - Achievement system definitions

### `/lib/` - Utilities
- `drag-validation.ts` - Complex drag & drop validation logic
- `validation.ts` - Challenge requirement validation
- `export.ts` - Design export functionality (PNG, JSON, Mermaid)

### `/core/` - Business Logic
- `simulator.ts` - Complete simulation engine implementation
- Separated from UI concerns for testability

## Important Implementation Details

### ReactFlow Integration
The canvas uses ReactFlow v12 with custom node types. Key considerations:
- All position updates must go through ReactFlow's change handlers
- Custom nodes receive props via the `data` property
- Edge connections trigger validation before creation

### Windows Path Handling
File paths use Windows-style backslashes. PowerShell commands work correctly with the existing scripts.

### Performance Considerations
- Simulation runs at 100ms tick intervals by default
- Large graphs (>50 nodes) may impact performance
- High RPS simulations (>1000) should use speed multipliers
- Metrics history is stored in memory during simulation

### Hierarchical Node System
Nodes can be nested with parent-child relationships:
- `parentId` - Reference to parent node
- `childrenIds` - Array of child node IDs  
- `nestingLevel` - Depth in hierarchy
- `placement` - 'in' or 'on' relative to parent

### Export Capabilities
Designs can be exported in multiple formats:
- **PNG** - Visual screenshot using html-to-image
- **JSON** - Complete design data with metadata
- **Mermaid** - Diagram-as-code format

## Common Development Tasks

### Adding New Node Types
1. Add to `NodeType` enum in `types/index.ts`
2. Create component metadata in `data/components.ts`
3. Add rendering logic in `SystemNode.tsx`
4. Update simulation engine processing in `simulator.ts`
5. Add placement rules to drag validation

### Creating New Challenges  
1. Define in `data/challenges.ts` with validation functions
2. Use existing helper functions (`hasNodeType`, `hasEdge`, `noDirectEdge`)
3. Set appropriate difficulty and point values
4. Include helpful hints for failed requirements

### Extending Simulation Metrics
1. Add new metric fields to appropriate interfaces in `types/simulation.ts`
2. Update collection logic in `simulator.ts` 
3. Add to metrics dashboard components
4. Update bottleneck analysis if relevant

### Adding Simulation Features
1. Extend `SimulationConfig` with new parameters
2. Update UI configuration components
3. Implement logic in simulation engine tick processing
4. Add appropriate event logging and metrics

The codebase emphasizes type safety, modular architecture, and real-time interactivity. The simulation engine is the most complex component, handling discrete event simulation with realistic system behavior modeling.
