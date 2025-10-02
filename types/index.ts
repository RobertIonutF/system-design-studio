import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

// Node types for system design components
export enum NodeType {
  CLIENT = 'client',
  API_GATEWAY = 'apiGateway',
  LOAD_BALANCER = 'loadBalancer',
  SERVICE = 'service',
  DATABASE = 'database',
  CACHE = 'cache',
  QUEUE = 'queue',
  PUBSUB = 'pubsub',
  OBJECT_STORAGE = 'objectStorage',
  METRICS = 'metrics',
  RATE_LIMITER = 'rateLimiter',
  CDN = 'cdn',
}

// Custom node data
export interface SystemNodeData {
  label: string;
  type: NodeType;
  description?: string;
  config?: Record<string, any>;
  // Hierarchical relationships
  parentId?: string;
  childrenIds?: string[];
  isCollapsed?: boolean;
  nestingLevel?: number;
  placement?: 'in' | 'on'; // How this node is placed relative to parent
}

export type SystemNode = ReactFlowNode<SystemNodeData>;
export type SystemEdge = ReactFlowEdge;

// Challenge types
export interface ChallengeRequirement {
  id: string;
  description: string;
  points: number;
  check: (nodes: SystemNode[], edges: SystemEdge[]) => boolean;
  hint?: string;
}

export enum ChallengeDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  requirements: ChallengeRequirement[];
  passingScore: number;
  maxPoints: number;
  estimatedTime: number; // in minutes
  tags: string[];
  hints?: string[];
}

// Badge types
export enum BadgeCategory {
  ARCHITECTURE = 'architecture',
  SCALABILITY = 'scalability',
  RELIABILITY = 'reliability',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  OBSERVABILITY = 'observability',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  condition: (userProgress: UserProgress) => boolean;
}

// User progress and profile
export interface ChallengeAttempt {
  challengeId: string;
  completedAt: Date;
  score: number;
  maxScore: number;
  timeTaken: number; // in seconds
  design: {
    nodes: SystemNode[];
    edges: SystemEdge[];
  };
}

export interface UserProgress {
  userId?: string;
  totalXP: number;
  level: number;
  challengesCompleted: string[];
  challengeAttempts: ChallengeAttempt[];
  badgesEarned: string[];
  currentStreak: number;
  lastActivityDate?: Date;
  createdAt: Date;
  conceptsCovered: {
    caching: boolean;
    queuing: boolean;
    loadBalancing: boolean;
    replication: boolean;
    eventDriven: boolean;
    observability: boolean;
  };
}

// Drag validation result
export interface DragValidationResult {
  isValid: boolean;
  placementType?: 'in' | 'on';
  reason?: string;
  targetNodeId?: string;
}

// Design validation result
export interface ValidationResult {
  passed: boolean;
  score: number;
  maxScore: number;
  requirementResults: {
    requirement: ChallengeRequirement;
    passed: boolean;
    earnedPoints: number;
  }[];
  feedback: string[];
  newBadges?: Badge[];
}

// Export options
export enum ExportFormat {
  PNG = 'png',
  JSON = 'json',
  MERMAID = 'mermaid',
}

export interface DesignExport {
  nodes: SystemNode[];
  edges: SystemEdge[];
  metadata: {
    challengeId?: string;
    createdAt: Date;
    version: string;
  };
}

// Drag and drop placement rules
export interface PlacementRules {
  acceptsIn?: NodeType[]; // Components that can be placed inside this node
  acceptsOn?: NodeType[]; // Components that can be placed on/attached to this node
  canConnectTo?: NodeType[]; // Components this node can connect to
  cannotConnectTo?: NodeType[]; // Components this node cannot connect to
  canRunOn?: NodeType[]; // What this node can be hosted on
  maxChildren?: number; // Maximum number of child nodes
  maxDepth?: number; // Maximum nesting depth
}

// Component metadata for the palette
export interface ComponentMetadata {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  category: 'entry' | 'gateway' | 'compute' | 'storage' | 'messaging' | 'observability';
  allowedConnections?: {
    canConnectTo?: NodeType[];
    cannotConnectTo?: NodeType[];
  };
  placementRules?: PlacementRules;
}

