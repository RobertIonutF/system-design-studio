import { ComponentMetadata, NodeType } from '@/types';

export const COMPONENT_METADATA: ComponentMetadata[] = [
  {
    type: NodeType.CLIENT,
    label: 'Client',
    description: 'End user or external system making requests',
    icon: 'User',
    category: 'entry',
    allowedConnections: {
      cannotConnectTo: [NodeType.DATABASE, NodeType.CACHE, NodeType.QUEUE, NodeType.PUBSUB],
    },
    placementRules: {
      canConnectTo: [NodeType.API_GATEWAY, NodeType.CDN, NodeType.LOAD_BALANCER],
    },
  },
  {
    type: NodeType.CDN,
    label: 'CDN',
    description: 'Content Delivery Network for static assets',
    icon: 'Globe',
    category: 'gateway',
    placementRules: {
      acceptsOn: [NodeType.METRICS],
      canConnectTo: [NodeType.OBJECT_STORAGE, NodeType.SERVICE],
    },
  },
  {
    type: NodeType.API_GATEWAY,
    label: 'API Gateway',
    description: 'Central entry point for API requests with routing and authentication',
    icon: 'GatewayIcon',
    category: 'gateway',
    placementRules: {
      acceptsOn: [NodeType.RATE_LIMITER, NodeType.METRICS],
      canConnectTo: [NodeType.SERVICE, NodeType.LOAD_BALANCER],
    },
  },
  {
    type: NodeType.LOAD_BALANCER,
    label: 'Load Balancer',
    description: 'Distributes traffic across multiple service instances',
    icon: 'Scale',
    category: 'gateway',
    placementRules: {
      acceptsIn: [NodeType.SERVICE],
      acceptsOn: [NodeType.METRICS],
      canConnectTo: [NodeType.SERVICE],
      maxChildren: 10,
    },
  },
  {
    type: NodeType.RATE_LIMITER,
    label: 'Rate Limiter',
    description: 'Controls request rate to prevent abuse',
    icon: 'Timer',
    category: 'gateway',
    placementRules: {
      canRunOn: [NodeType.API_GATEWAY, NodeType.LOAD_BALANCER],
    },
  },
  {
    type: NodeType.SERVICE,
    label: 'Service',
    description: 'Application server or microservice',
    icon: 'Server',
    category: 'compute',
    placementRules: {
      acceptsOn: [NodeType.METRICS, NodeType.CACHE],
      canConnectTo: [NodeType.DATABASE, NodeType.QUEUE, NodeType.PUBSUB, NodeType.OBJECT_STORAGE],
      canRunOn: [NodeType.LOAD_BALANCER],
    },
  },
  {
    type: NodeType.DATABASE,
    label: 'Database',
    description: 'Persistent data storage (SQL/NoSQL)',
    icon: 'Database',
    category: 'storage',
    placementRules: {
      acceptsOn: [NodeType.METRICS],
      acceptsIn: [NodeType.CACHE],
    },
  },
  {
    type: NodeType.CACHE,
    label: 'Cache',
    description: 'In-memory data store for fast access (Redis, Memcached)',
    icon: 'Zap',
    category: 'storage',
    placementRules: {
      acceptsOn: [NodeType.METRICS],
      canRunOn: [NodeType.SERVICE, NodeType.DATABASE],
    },
  },
  {
    type: NodeType.OBJECT_STORAGE,
    label: 'Object Storage',
    description: 'Scalable storage for files and blobs (S3, GCS)',
    icon: 'HardDrive',
    category: 'storage',
    placementRules: {
      acceptsOn: [NodeType.METRICS],
    },
  },
  {
    type: NodeType.QUEUE,
    label: 'Queue',
    description: 'Message queue for asynchronous processing (SQS, RabbitMQ)',
    icon: 'ListOrdered',
    category: 'messaging',
    placementRules: {
      acceptsOn: [NodeType.METRICS],
      canConnectTo: [NodeType.SERVICE],
    },
  },
  {
    type: NodeType.PUBSUB,
    label: 'Pub/Sub',
    description: 'Publish-subscribe messaging system (Kafka, SNS)',
    icon: 'Rss',
    category: 'messaging',
    placementRules: {
      acceptsOn: [NodeType.METRICS],
      canConnectTo: [NodeType.SERVICE],
    },
  },
  {
    type: NodeType.METRICS,
    label: 'Metrics',
    description: 'Monitoring and observability system (Prometheus, Datadog)',
    icon: 'LineChart',
    category: 'observability',
    placementRules: {
      canRunOn: [NodeType.SERVICE, NodeType.DATABASE, NodeType.CACHE, NodeType.QUEUE, NodeType.PUBSUB, NodeType.API_GATEWAY, NodeType.LOAD_BALANCER, NodeType.CDN, NodeType.OBJECT_STORAGE],
    },
  },
];

export const getComponentMetadata = (type: NodeType): ComponentMetadata | undefined => {
  return COMPONENT_METADATA.find((comp) => comp.type === type);
};

