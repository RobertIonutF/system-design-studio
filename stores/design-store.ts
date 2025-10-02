import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Connection, EdgeChange, NodeChange } from '@xyflow/react';
import { SystemNode, SystemEdge, NodeType, DragValidationResult } from '@/types';
import { DragValidator } from '@/lib/drag-validation';

interface DesignState {
  nodes: SystemNode[];
  edges: SystemEdge[];
  selectedChallenge: string | null;
  startTime: number | null;
  dragOverNodeId: string | null;
  draggedNodeId: string | null;
  
  // Actions
  setNodes: (nodes: SystemNode[]) => void;
  setEdges: (edges: SystemEdge[]) => void;
  onNodesChange: (changes: NodeChange<SystemNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (nodeType: NodeType, position: { x: number; y: number }) => void;
  clearDesign: () => void;
  setSelectedChallenge: (challengeId: string | null) => void;
  startTimer: () => void;
  getElapsedTime: () => number;
  
  // Hierarchical operations
  placeNodeInTarget: (draggedNodeId: string, targetNodeId: string, placement: 'in' | 'on') => boolean;
  removeFromParent: (nodeId: string) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  getNodeChildren: (nodeId: string) => SystemNode[];
  validateNodePlacement: (draggedNodeId: string, targetNodeId: string) => DragValidationResult;
  setDragState: (draggedNodeId: string | null, dragOverNodeId: string | null) => void;
  moveNodeGroup: (nodeId: string, deltaX: number, deltaY: number) => void;
}

let nodeIdCounter = 0;

export const useDesignStore = create<DesignState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedChallenge: null,
  startTime: null,
  dragOverNodeId: null,
  draggedNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    
    // Validation: Check connection rules
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return;
    
    const sourceType = sourceNode.data.type;
    const targetType = targetNode.data.type;
    
    // Prevent direct Client -> Database, Client -> Cache, etc.
    if (sourceType === NodeType.CLIENT) {
      const forbiddenTargets = [NodeType.DATABASE, NodeType.CACHE, NodeType.QUEUE, NodeType.PUBSUB];
      if (forbiddenTargets.includes(targetType)) {
        // TODO: Show toast notification
        console.warn('Invalid connection: Clients should not connect directly to databases or internal services');
        return;
      }
    }
    
    set({
      edges: addEdge(connection, edges),
    });
  },

  addNode: (nodeType, position) => {
    const id = `node-${nodeIdCounter++}`;
    const metadata = require('@/data/components').getComponentMetadata(nodeType);
    
    const newNode: SystemNode = {
      id,
      type: 'systemComponent',
      position,
      data: {
        label: metadata?.label || nodeType,
        type: nodeType,
        description: metadata?.description,
        childrenIds: [],
        nestingLevel: 0,
        isCollapsed: false,
      },
    };
    
    set({ nodes: [...get().nodes, newNode] });
  },

  clearDesign: () => {
    set({ 
      nodes: [], 
      edges: [],
      startTime: Date.now(),
    });
  },

  setSelectedChallenge: (challengeId) => {
    set({ 
      selectedChallenge: challengeId,
      startTime: Date.now(),
    });
  },

  startTimer: () => {
    set({ startTime: Date.now() });
  },

  getElapsedTime: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },

  // Hierarchical operations
  placeNodeInTarget: (draggedNodeId, targetNodeId, placement) => {
    const { nodes } = get();
    const draggedNode = nodes.find(n => n.id === draggedNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    
    if (!draggedNode || !targetNode) return false;
    
    // Validate placement
    const validation = DragValidator.validatePlacement(draggedNode, targetNode, nodes);
    if (!validation.isValid) return false;
    
    // Remove from previous parent if exists
    if (draggedNode.data.parentId) {
      get().removeFromParent(draggedNodeId);
    }
    
    // Calculate new position
    const targetChildren = get().getNodeChildren(targetNodeId);
    const childIndex = targetChildren.filter(c => c.data.placement === placement).length;
    const newPosition = DragValidator.calculateChildPosition(targetNode, childIndex, placement);
    
    // Update nodes
    const updatedNodes = nodes.map(node => {
      if (node.id === draggedNodeId) {
        return {
          ...node,
          position: newPosition,
          data: {
            ...node.data,
            parentId: targetNodeId,
            placement,
            nestingLevel: (targetNode.data.nestingLevel || 0) + 1,
          },
        };
      }
      if (node.id === targetNodeId) {
        const currentChildrenIds = node.data.childrenIds || [];
        return {
          ...node,
          data: {
            ...node.data,
            childrenIds: [...currentChildrenIds, draggedNodeId],
          },
        };
      }
      return node;
    });
    
    set({ nodes: updatedNodes });
    return true;
  },
  
  removeFromParent: (nodeId) => {
    const { nodes } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node?.data.parentId) return;
    
    const updatedNodes = nodes.map(n => {
      if (n.id === node.data.parentId) {
        return {
          ...n,
          data: {
            ...n.data,
            childrenIds: (n.data.childrenIds || []).filter(id => id !== nodeId),
          },
        };
      }
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            parentId: undefined,
            placement: undefined,
            nestingLevel: 0,
          },
        };
      }
      return n;
    });
    
    set({ nodes: updatedNodes });
  },
  
  toggleNodeCollapse: (nodeId) => {
    const { nodes } = get();
    
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            isCollapsed: !node.data.isCollapsed,
          },
        };
      }
      return node;
    });
    
    set({ nodes: updatedNodes });
  },
  
  getNodeChildren: (nodeId) => {
    const { nodes } = get();
    const parentNode = nodes.find(n => n.id === nodeId);
    if (!parentNode?.data.childrenIds) return [];
    
    return nodes.filter(node => parentNode.data.childrenIds?.includes(node.id));
  },
  
  validateNodePlacement: (draggedNodeId, targetNodeId) => {
    const { nodes } = get();
    const draggedNode = nodes.find(n => n.id === draggedNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    
    if (!draggedNode || !targetNode) {
      return { isValid: false, reason: 'Node not found' };
    }
    
    return DragValidator.validatePlacement(draggedNode, targetNode, nodes);
  },
  
  setDragState: (draggedNodeId, dragOverNodeId) => {
    set({ draggedNodeId, dragOverNodeId });
  },
  
  moveNodeGroup: (nodeId, deltaX, deltaY) => {
    const { nodes } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Get all child nodes recursively
    const getAllDescendants = (parentId: string): string[] => {
      const children = nodes.filter(n => n.data.parentId === parentId);
      const descendants = [...children.map(c => c.id)];
      
      for (const child of children) {
        descendants.push(...getAllDescendants(child.id));
      }
      
      return descendants;
    };
    
    const affectedNodeIds = [nodeId, ...getAllDescendants(nodeId)];
    
    const updatedNodes = nodes.map(n => {
      if (affectedNodeIds.includes(n.id)) {
        return {
          ...n,
          position: {
            x: n.position.x + deltaX,
            y: n.position.y + deltaY,
          },
        };
      }
      return n;
    });
    
    set({ nodes: updatedNodes });
  },
}));

