# System Design Practice Studio

<div align="center">
  <h3>🎯 Master System Design Through Interactive Practice</h3>
  <p>An interactive web application for engineers to design, simulate, and validate software system architectures through gamified learning and real-time performance analysis.</p>
</div>

---

## ✨ Features

### 🎨 **Interactive Design Canvas**
- **Drag-and-Drop Interface**: Intuitive visual editor powered by ReactFlow
- **12+ System Components**: Client, API Gateway, Load Balancer, Service, Database, Cache, Queue, Pub/Sub, Object Storage, CDN, Metrics, Rate Limiter
- **Hierarchical Placement**: Place components inside or attached to other components
- **Advanced Interactions**: Ctrl+Drag to duplicate, Alt+Drag to auto-connect
- **Real-time Validation**: Prevents invalid connections (e.g., Client → Database)

### 🎮 **Gamified Learning System**
- **Structured Challenges**: Progressive difficulty from Beginner to Expert
- **Real-time Scoring**: Instant feedback with requirement validation
- **Badge System**: Earn achievements for different architectural patterns
- **XP & Levels**: Track progress with experience points and level progression
- **Streak Tracking**: Maintain daily learning streaks

### ⚡ **Advanced Simulation Engine**
- **Discrete Event Simulation**: Real-time request flow simulation with 100ms tick processing
- **Performance Metrics**: RPS, latency, error rates, queue depths, CPU utilization
- **Auto-scaling Logic**: Dynamic service scaling based on load thresholds
- **Bottleneck Analysis**: Automated detection and severity classification of performance issues
- **Configurable Scenarios**: Customize load patterns, error rates, and failure modes
- **Chaos Engineering**: Test resilience with failure injection and network partitions

### 📊 **Real-time Analytics**
- **Live Metrics Dashboard**: Interactive charts showing system performance
- **Event Log Console**: Real-time streaming of system events with filtering
- **Simulation Results**: Comprehensive post-simulation analysis and recommendations
- **Export Capabilities**: Save designs as PNG, JSON, or Mermaid diagrams

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```powershell
# Clone the repository
git clone <repository-url>
cd system-design-studio

# Install dependencies
npm install

# Start development server with Turbo
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Build for Production

```powershell
# Build with Turbo optimization
npm run build

# Start production server
npm start
```

## 🎯 How It Works

### 1. **Design Phase**
- Select from 12+ system components in the component palette
- Drag components onto the canvas to build your architecture
- Connect components with edges to define data flow
- Use hierarchical placement for complex nested architectures

### 2. **Challenge Mode**
- Choose from structured challenges (Basic API, Scalable Upload, Event-Driven Orders, etc.)
- Get real-time feedback as you build your solution
- Earn points for meeting requirements correctly
- Unlock new challenges and earn badges

### 3. **Simulation Mode**
- Configure load parameters (RPS, users, payload size, error rates)
- Choose from presets: Low Traffic, Moderate Load, High Traffic, Chaos Mode
- Watch real-time metrics as requests flow through your system
- Analyze bottlenecks and get optimization recommendations

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand with persistence middleware
- **Canvas**: ReactFlow for interactive node-based diagrams
- **Charts**: Recharts for real-time metrics visualization
- **Type Safety**: Full TypeScript coverage with strict mode

### **Core Systems**
- **Design Store**: Manages canvas state, node placement, and drag validation
- **Progress Store**: Tracks user advancement, badges, and challenge completion
- **Simulation Store**: Controls simulation engine, metrics, and configuration
- **Simulation Engine**: Discrete event simulator with request routing and metrics collection

## 📋 Available Challenges

| Challenge | Difficulty | Focus Areas | Estimated Time |
|-----------|------------|-------------|----------------|
| **Build a Basic API Service** | Beginner | API Gateway, Services | 10 min |
| **Add a Caching Layer** | Beginner | Performance, Caching | 15 min |
| **Scalable File Upload Service** | Intermediate | Load Balancing, Object Storage | 20 min |
| **Event-Driven Order Processing** | Intermediate | Messaging, Async Processing | 25 min |

## 🎨 System Components

### **Entry Points**
- **Client**: Request generators with configurable load patterns

### **Gateway Layer** 
- **API Gateway**: Central entry point with routing capabilities
- **Load Balancer**: Traffic distribution across service instances
- **CDN**: Content delivery for static assets
- **Rate Limiter**: Request throttling and protection

### **Compute Layer**
- **Service**: Business logic processors with auto-scaling

### **Storage Layer**
- **Database**: Persistent data storage with configurable latency
- **Cache**: In-memory storage with hit/miss simulation
- **Object Storage**: Scalable file storage (S3-like)

### **Messaging Layer**
- **Queue**: FIFO message processing with depth monitoring
- **Pub/Sub**: Event-driven messaging patterns

### **Observability**
- **Metrics**: System monitoring and alerting

## 🛠️ Development

### **Key Commands**
```powershell
npm run dev      # Development server with hot reload
npm run build    # Production build with Turbo
npm run start    # Start production server
npm run lint     # Run ESLint
```

### **Project Structure**
```
├── app/                 # Next.js App Router
├── components/          # React components
├── stores/             # Zustand state management
├── types/              # TypeScript definitions
├── data/               # Static data (challenges, components)
├── lib/                # Utility functions
├── core/               # Business logic (simulation engine)
├── styles/             # CSS and animations
└── public/             # Static assets
```

## 🔧 Configuration

### **Simulation Parameters**
- **Load Testing**: 1-10,000 RPS with concurrent user simulation
- **Performance Tuning**: Cache hit ratios, DB latency, CPU costs
- **Reliability Testing**: Error injection, failure modes, chaos engineering
- **Environment Controls**: Auto-scaling thresholds, consistency models

### **Export Options**
- **PNG**: High-quality visual export of designs
- **JSON**: Complete design data with metadata
- **Mermaid**: Diagram-as-code format for documentation

## 🎯 Learning Outcomes

By using System Design Practice Studio, engineers will:

- ✅ **Master Core Patterns**: Load balancing, caching, queuing, event-driven architectures
- ✅ **Understand Trade-offs**: Performance vs. consistency, scalability vs. complexity
- ✅ **Practice Real Scenarios**: File uploads, order processing, API design
- ✅ **Learn Through Simulation**: See how designs perform under different load conditions
- ✅ **Build Portfolio**: Export and share completed designs

## 📈 Performance Characteristics

- **Simulation Speed**: 1x to 10x with configurable tick rates
- **Max Throughput**: Up to 10,000 RPS simulation
- **Node Limit**: Optimized for graphs up to 50 nodes
- **Metrics History**: Real-time collection with in-memory storage
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🤝 Contributing

Contributions are welcome! Key areas for enhancement:

- **New Challenges**: Add domain-specific scenarios
- **Component Types**: Extend with new system components 
- **Simulation Features**: Advanced failure modes and network modeling
- **UI/UX**: Improved accessibility and mobile support
- **Testing**: Automated testing for validation logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for engineers who want to master system design through hands-on practice</p>
</div>
