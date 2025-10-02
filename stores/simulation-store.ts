import { create } from 'zustand';
import { SimulationEngine } from '@/core/simulator';
import {
  SimulationConfig,
  SimulationStatus,
  SimulationEvent,
  SystemMetrics,
  SimulationResult,
  DEFAULT_SIMULATION_CONFIG,
  SimulationPreset,
} from '@/types/simulation';

interface SimulationStore {
  // State
  engine: SimulationEngine | null;
  status: SimulationStatus;
  config: SimulationConfig;
  currentTime: number;
  events: SimulationEvent[];
  metrics: SystemMetrics | null;
  result: SimulationResult | null;
  speed: number;
  
  // UI State
  showConfigModal: boolean;
  showLogConsole: boolean;
  showMetricsDashboard: boolean;
  showSummary: boolean;
  logFilter: 'all' | 'errors' | 'performance' | 'scaling';
  
  // Presets
  presets: SimulationPreset[];
  currentPreset: string | null;
  
  // Actions
  initializeSimulation: (config?: SimulationConfig) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: number) => void;
  updateConfig: (config: Partial<SimulationConfig>) => void;
  
  // UI Actions
  setShowConfigModal: (show: boolean) => void;
  setShowLogConsole: (show: boolean) => void;
  setShowMetricsDashboard: (show: boolean) => void;
  setShowSummary: (show: boolean) => void;
  setLogFilter: (filter: 'all' | 'errors' | 'performance' | 'scaling') => void;
  
  // Preset Actions
  savePreset: (name: string, description: string, tags: string[]) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  
  // Internal event handlers
  handleSimulationEvent: (event: SimulationEvent) => void;
  handleMetricsUpdate: (metrics: SystemMetrics) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial State
  engine: null,
  status: SimulationStatus.IDLE,
  config: DEFAULT_SIMULATION_CONFIG,
  currentTime: 0,
  events: [],
  metrics: null,
  result: null,
  speed: 1,
  
  // UI State
  showConfigModal: false,
  showLogConsole: true,
  showMetricsDashboard: true,
  showSummary: false,
  logFilter: 'all',
  
  // Presets
  presets: [
    {
      id: 'low-traffic',
      name: 'Low Traffic',
      description: 'Simulates light load for testing basic functionality',
      config: {
        ...DEFAULT_SIMULATION_CONFIG,
        requestsPerSecond: 10,
        concurrentUsers: 5,
        duration: 20,
      },
      tags: ['beginner', 'testing'],
    },
    {
      id: 'moderate-load',
      name: 'Moderate Load',
      description: 'Standard production-like traffic',
      config: DEFAULT_SIMULATION_CONFIG,
      tags: ['intermediate', 'production'],
    },
    {
      id: 'high-traffic',
      name: 'High Traffic',
      description: 'Heavy load to test system limits',
      config: {
        ...DEFAULT_SIMULATION_CONFIG,
        requestsPerSecond: 1000,
        concurrentUsers: 500,
        errorRate: 0.02,
        duration: 60,
      },
      tags: ['advanced', 'stress-test'],
    },
    {
      id: 'chaos-mode',
      name: 'Chaos Mode',
      description: 'Unpredictable conditions with failures and spikes',
      config: {
        ...DEFAULT_SIMULATION_CONFIG,
        requestsPerSecond: 500,
        errorRate: 0.05,
        chaosMode: true,
        failureInjection: true,
        duration: 45,
      },
      tags: ['advanced', 'chaos', 'resilience'],
    },
  ],
  currentPreset: null,

  // Actions
  initializeSimulation: (config = DEFAULT_SIMULATION_CONFIG) => {
    const { engine } = get();
    
    // Clean up existing engine
    if (engine) {
      engine.stop();
    }
    
    // Get current nodes and edges from design store
    const designStore = require('@/stores/design-store');
    const { nodes, edges } = designStore.useDesignStore.getState();
    
    if (nodes.length === 0) {
      console.warn('No nodes in design - cannot initialize simulation');
      return;
    }
    
    // Create new engine
    const newEngine = new SimulationEngine(nodes, edges, config);
    
    // Subscribe to events
    newEngine.onEvent((event) => {
      get().handleSimulationEvent(event);
    });
    
    newEngine.onMetricsUpdate((metrics) => {
      get().handleMetricsUpdate(metrics);
    });
    
    set({
      engine: newEngine,
      config,
      status: SimulationStatus.IDLE,
      events: [],
      metrics: null,
      result: null,
      showSummary: false,
    });
  },

  startSimulation: () => {
    const { engine, config } = get();
    
    if (!engine) {
      get().initializeSimulation(config);
      // Get the newly created engine
      const newEngine = get().engine;
      if (newEngine) {
        newEngine.start();
      }
    } else {
      engine.start();
    }
    
    set({ 
      status: SimulationStatus.RUNNING,
      showConfigModal: false,
    });
  },

  pauseSimulation: () => {
    const { engine } = get();
    if (engine) {
      engine.pause();
      set({ status: SimulationStatus.PAUSED });
    }
  },

  resumeSimulation: () => {
    const { engine } = get();
    if (engine) {
      engine.resume();
      set({ status: SimulationStatus.RUNNING });
    }
  },

  stopSimulation: () => {
    const { engine, status } = get();
    if (engine) {
      engine.stop();
      const result = engine.getResult();
      // Only show summary if not already shown
      const shouldShowSummary = status !== SimulationStatus.COMPLETED;
      set({ 
        status: SimulationStatus.STOPPED,
        result,
        showSummary: shouldShowSummary,
      });
    }
  },

  resetSimulation: () => {
    const { engine, config } = get();
    if (engine) {
      engine.stop();
    }
    
    set({
      engine: null,
      status: SimulationStatus.IDLE,
      events: [],
      metrics: null,
      result: null,
      currentTime: 0,
      showSummary: false,
    });
    
    // Reinitialize with current config
    get().initializeSimulation(config);
  },

  setSpeed: (speed: number) => {
    const { engine } = get();
    if (engine) {
      engine.setSpeed(speed);
    }
    set({ speed });
  },

  updateConfig: (configUpdate: Partial<SimulationConfig>) => {
    set((state) => ({
      config: { ...state.config, ...configUpdate },
    }));
  },

  // UI Actions
  setShowConfigModal: (show: boolean) => set({ showConfigModal: show }),
  setShowLogConsole: (show: boolean) => set({ showLogConsole: show }),
  setShowMetricsDashboard: (show: boolean) => set({ showMetricsDashboard: show }),
  setShowSummary: (show: boolean) => set({ showSummary: show }),
  setLogFilter: (filter) => set({ logFilter: filter }),

  // Preset Actions
  savePreset: (name: string, description: string, tags: string[]) => {
    const { config, presets } = get();
    const newPreset: SimulationPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      config: { ...config },
      tags,
    };
    
    set({ presets: [...presets, newPreset] });
  },

  loadPreset: (presetId: string) => {
    const { presets } = get();
    const preset = presets.find(p => p.id === presetId);
    
    if (preset) {
      set({ 
        config: { ...preset.config },
        currentPreset: presetId,
      });
    }
  },

  deletePreset: (presetId: string) => {
    set((state) => ({
      presets: state.presets.filter(p => p.id !== presetId),
      currentPreset: state.currentPreset === presetId ? null : state.currentPreset,
    }));
  },

  // Event Handlers
  handleSimulationEvent: (event: SimulationEvent) => {
    set((state) => ({
      events: [...state.events, event],
      currentTime: event.timestamp,
    }));
    
    // Check if simulation completed - only trigger once
    if (event.message.includes('completed')) {
      const { engine, status } = get();
      // Only show summary if we're not already in completed state
      if (engine && status !== SimulationStatus.COMPLETED) {
        const result = engine.getResult();
        set({ 
          status: SimulationStatus.COMPLETED,
          result,
          showSummary: true,
        });
      }
    }
  },

  handleMetricsUpdate: (metrics: SystemMetrics) => {
    set({ metrics });
  },
}));

