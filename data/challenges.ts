import { Challenge, ChallengeDifficulty, NodeType, SystemNode, SystemEdge } from '@/types';

// Helper functions for validation
const hasNodeType = (nodes: SystemNode[], type: NodeType, minCount = 1): boolean => {
  return nodes.filter((n) => n.data.type === type).length >= minCount;
};

const hasEdge = (edges: SystemEdge[], sourceType: NodeType, targetType: NodeType, nodes: SystemNode[]): boolean => {
  return edges.some((edge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    return source?.data.type === sourceType && target?.data.type === targetType;
  });
};

const noDirectEdge = (edges: SystemEdge[], sourceType: NodeType, targetType: NodeType, nodes: SystemNode[]): boolean => {
  return !hasEdge(edges, sourceType, targetType, nodes);
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'basic-api',
    title: 'Build a Basic API Service',
    description: 'Design a simple API architecture with proper separation of concerns. Clients should connect through an API Gateway to reach backend services.',
    difficulty: ChallengeDifficulty.BEGINNER,
    estimatedTime: 10,
    tags: ['api', 'gateway', 'basics'],
    maxPoints: 50,
    passingScore: 40,
    requirements: [
      {
        id: 'has-client',
        description: 'Include at least one Client node',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.CLIENT),
        hint: 'Add a Client component to represent the user or external system',
      },
      {
        id: 'has-api-gateway',
        description: 'Include an API Gateway',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.API_GATEWAY),
        hint: 'API Gateway acts as the entry point for all client requests',
      },
      {
        id: 'has-service',
        description: 'Include at least one Service node',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.SERVICE),
        hint: 'Services handle business logic',
      },
      {
        id: 'client-to-gateway',
        description: 'Connect Client to API Gateway',
        points: 10,
        check: (nodes, edges) => hasEdge(edges, NodeType.CLIENT, NodeType.API_GATEWAY, nodes),
        hint: 'Draw an edge from Client to API Gateway',
      },
      {
        id: 'no-direct-client-db',
        description: 'Client should NOT connect directly to Database',
        points: 10,
        check: (nodes, edges) => noDirectEdge(edges, NodeType.CLIENT, NodeType.DATABASE, nodes),
        hint: 'Never allow clients to access databases directly',
      },
    ],
  },
  {
    id: 'scalable-upload',
    title: 'Design a Scalable File Upload Service',
    description: 'Create an architecture that can handle file uploads at scale with proper load balancing and object storage.',
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    estimatedTime: 20,
    tags: ['upload', 'storage', 'scaling'],
    maxPoints: 80,
    passingScore: 65,
    requirements: [
      {
        id: 'has-load-balancer',
        description: 'Include a Load Balancer',
        points: 15,
        check: (nodes) => hasNodeType(nodes, NodeType.LOAD_BALANCER),
        hint: 'Load balancers distribute traffic across multiple service instances',
      },
      {
        id: 'multiple-services',
        description: 'Include at least 2 Service nodes (for redundancy)',
        points: 15,
        check: (nodes) => hasNodeType(nodes, NodeType.SERVICE, 2),
        hint: 'Multiple service instances provide redundancy and handle more load',
      },
      {
        id: 'has-object-storage',
        description: 'Include Object Storage for files',
        points: 15,
        check: (nodes) => hasNodeType(nodes, NodeType.OBJECT_STORAGE),
        hint: 'Object storage (like S3) is designed for file storage at scale',
      },
      {
        id: 'has-database',
        description: 'Include a Database for metadata',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.DATABASE),
        hint: 'Database stores file metadata (names, sizes, permissions)',
      },
      {
        id: 'service-to-storage',
        description: 'Connect Service to Object Storage',
        points: 15,
        check: (nodes, edges) => hasEdge(edges, NodeType.SERVICE, NodeType.OBJECT_STORAGE, nodes),
        hint: 'Services should write uploaded files to object storage',
      },
      {
        id: 'has-metrics',
        description: 'Include Metrics for monitoring',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.METRICS),
        hint: 'Always monitor your system performance',
      },
    ],
  },
  {
    id: 'event-driven-orders',
    title: 'Event-Driven Order Processing Pipeline',
    description: 'Design an asynchronous order processing system using queues or pub/sub for decoupled, reliable processing.',
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    tags: ['events', 'async', 'messaging'],
    estimatedTime: 25,
    maxPoints: 100,
    passingScore: 75,
    requirements: [
      {
        id: 'has-queue-or-pubsub',
        description: 'Include Queue or Pub/Sub for messaging',
        points: 20,
        check: (nodes) => hasNodeType(nodes, NodeType.QUEUE) || hasNodeType(nodes, NodeType.PUBSUB),
        hint: 'Queues and Pub/Sub enable asynchronous communication',
      },
      {
        id: 'multiple-services',
        description: 'Include at least 2 different Service nodes',
        points: 15,
        check: (nodes) => hasNodeType(nodes, NodeType.SERVICE, 2),
        hint: 'One service publishes events, others consume them',
      },
      {
        id: 'has-database',
        description: 'Include a Database',
        points: 15,
        check: (nodes) => hasNodeType(nodes, NodeType.DATABASE),
        hint: 'Store order data persistently',
      },
      {
        id: 'service-to-queue',
        description: 'Connect Service to Queue/Pub-Sub',
        points: 20,
        check: (nodes, edges) => 
          hasEdge(edges, NodeType.SERVICE, NodeType.QUEUE, nodes) ||
          hasEdge(edges, NodeType.SERVICE, NodeType.PUBSUB, nodes),
        hint: 'Services publish messages to the queue',
      },
      {
        id: 'queue-to-service',
        description: 'Connect Queue/Pub-Sub to another Service (consumer)',
        points: 20,
        check: (nodes, edges) => 
          hasEdge(edges, NodeType.QUEUE, NodeType.SERVICE, nodes) ||
          hasEdge(edges, NodeType.PUBSUB, NodeType.SERVICE, nodes),
        hint: 'Consumer services read from the queue',
      },
      {
        id: 'has-metrics',
        description: 'Include Metrics for observability',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.METRICS),
        hint: 'Monitor queue depth and processing latency',
      },
    ],
  },
  {
    id: 'caching-layer',
    title: 'Add a Caching Layer',
    description: 'Improve performance by adding a cache between services and the database.',
    difficulty: ChallengeDifficulty.BEGINNER,
    estimatedTime: 15,
    tags: ['cache', 'performance'],
    maxPoints: 60,
    passingScore: 45,
    requirements: [
      {
        id: 'has-cache',
        description: 'Include a Cache node',
        points: 20,
        check: (nodes) => hasNodeType(nodes, NodeType.CACHE),
        hint: 'Redis or Memcached are common caching solutions',
      },
      {
        id: 'has-service',
        description: 'Include a Service node',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.SERVICE),
        hint: 'Services query the cache',
      },
      {
        id: 'has-database',
        description: 'Include a Database node',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.DATABASE),
        hint: 'Database is the source of truth',
      },
      {
        id: 'service-to-cache',
        description: 'Connect Service to Cache',
        points: 10,
        check: (nodes, edges) => hasEdge(edges, NodeType.SERVICE, NodeType.CACHE, nodes),
        hint: 'Services should check cache first',
      },
      {
        id: 'service-to-db',
        description: 'Connect Service to Database',
        points: 10,
        check: (nodes, edges) => hasEdge(edges, NodeType.SERVICE, NodeType.DATABASE, nodes),
        hint: 'On cache miss, query the database',
      },
    ],
  },
  {
    id: 'rate-limiting',
    title: 'Protect Your API with Rate Limiting',
    description: 'Add rate limiting to protect your services from abuse and ensure fair usage.',
    difficulty: ChallengeDifficulty.BEGINNER,
    estimatedTime: 10,
    tags: ['security', 'rate-limiting'],
    maxPoints: 50,
    passingScore: 40,
    requirements: [
      {
        id: 'has-rate-limiter',
        description: 'Include a Rate Limiter',
        points: 20,
        check: (nodes) => hasNodeType(nodes, NodeType.RATE_LIMITER),
        hint: 'Rate limiters control request frequency',
      },
      {
        id: 'has-api-gateway',
        description: 'Include an API Gateway',
        points: 10,
        check: (nodes) => hasNodeType(nodes, NodeType.API_GATEWAY),
        hint: 'API Gateway coordinates routing',
      },
      {
        id: 'gateway-to-rate-limiter',
        description: 'Connect API Gateway to Rate Limiter',
        points: 20,
        check: (nodes, edges) => hasEdge(edges, NodeType.API_GATEWAY, NodeType.RATE_LIMITER, nodes),
        hint: 'Requests pass through rate limiter first',
      },
    ],
  },
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return CHALLENGES.find((c) => c.id === id);
};

