'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SystemNode as SystemNodeComponent } from './SystemNode';
import { useDesignStore } from '@/stores/design-store';
import { NodeType, SystemNode, DragValidationResult } from '@/types';
import { Button } from './ui/button';
import { Trash2, Download, Grid, Move } from 'lucide-react';
import { DragValidator } from '@/lib/drag-validation';
import { toast } from 'sonner';

const nodeTypes = {
  systemComponent: SystemNodeComponent,
};

interface DesignCanvasProps {
  onExport?: () => void;
}

function DesignCanvasInner({ onExport }: DesignCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [isDragActive, setIsDragActive] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [dragValidation, setDragValidation] = useState<DragValidationResult | null>(null);
  const [keyPressed, setKeyPressed] = useState<Set<string>>(new Set());
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearDesign,
    draggedNodeId,
    dragOverNodeId,
    setDragState,
    placeNodeInTarget,
    validateNodePlacement,
    moveNodeGroup,
  } = useDesignStore();

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeyPressed(prev => new Set(prev).add(event.key));
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      setKeyPressed(prev => {
        const next = new Set(prev);
        next.delete(event.key);
        return next;
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      
      if (!nodeType || !reactFlowWrapper.current) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check if dropping on a target node for hierarchical placement
      if (dragOverTarget && dragValidation?.isValid) {
        // First create the node
        const tempId = `temp-${Date.now()}`;
        addNode(nodeType, position);
        
        // Then try to place it in the target
        setTimeout(() => {
          const newNodes = useDesignStore.getState().nodes;
          const createdNode = newNodes[newNodes.length - 1];
          if (createdNode && dragValidation.placementType) {
            const success = placeNodeInTarget(createdNode.id, dragOverTarget, dragValidation.placementType);
            if (success) {
              toast.success(`${createdNode.data.label} placed ${dragValidation.placementType} ${nodes.find(n => n.id === dragOverTarget)?.data.label}`);
            }
          }
        }, 10);
      } else {
        addNode(nodeType, position);
      }
      
      // Reset drag state
      setDragOverTarget(null);
      setDragValidation(null);
    },
    [screenToFlowPosition, addNode, dragOverTarget, dragValidation, placeNodeInTarget, nodes]
  );

  // Advanced drag handlers for existing nodes
  const onNodeDragStart: NodeMouseHandler = useCallback((event, node) => {
    setIsDragActive(true);
    setDragState(node.id, null);
    
    // Duplicate node with Ctrl+Drag
    if (keyPressed.has('Control')) {
      event.preventDefault();
      const systemNode = node as unknown as SystemNode;
      const newPosition = {
        x: node.position.x + 50,
        y: node.position.y + 50,
      };
      addNode(systemNode.data.type, newPosition);
      toast.success(`Duplicated ${systemNode.data.label}`);
    }
  }, [setDragState, keyPressed, addNode]);

  const onNodeDrag: NodeMouseHandler = useCallback((event, node) => {
    // Find potential drop targets
    const mousePosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const nearbyNodes = DragValidator.findNodesInRange(mousePosition, nodes.filter(n => n.id !== node.id));
    
    if (nearbyNodes.length > 0) {
      const targetNode = nearbyNodes[0];
      const validation = validateNodePlacement(node.id, targetNode.id);
      setDragOverTarget(targetNode.id);
      setDragValidation(validation);
      setDragState(node.id, targetNode.id);
      
      if (!validation.isValid && validation.reason) {
        // Show validation error as tooltip (you could implement a tooltip system)
        console.log('Drag validation:', validation.reason);
      }
    } else {
      setDragOverTarget(null);
      setDragValidation(null);
      setDragState(node.id, null);
    }
  }, [screenToFlowPosition, validateNodePlacement, setDragState, nodes]);

  const onNodeDragStop: NodeMouseHandler = useCallback((event, node) => {
    setIsDragActive(false);
    
    // Handle hierarchical drop
    if (dragOverTarget && dragValidation?.isValid && dragValidation.placementType) {
      const success = placeNodeInTarget(node.id, dragOverTarget, dragValidation.placementType);
      if (success) {
        const targetNode = nodes.find(n => n.id === dragOverTarget);
        toast.success(`${node.data.label} placed ${dragValidation.placementType} ${targetNode?.data.label}`);
      } else {
        toast.error('Failed to place node');
      }
    }
    
    // Auto-connect with Alt+Drag
    if (keyPressed.has('Alt') && dragOverTarget && !dragValidation?.isValid) {
      const targetNode = nodes.find(n => n.id === dragOverTarget);
      if (targetNode && DragValidator.canConnect(node.data.type, targetNode.data.type)) {
        onConnect({ source: node.id, target: dragOverTarget });
        toast.success(`Connected ${node.data.label} to ${targetNode.data.label}`);
      }
    }
    
    // Reset drag state
    setDragState(null, null);
    setDragOverTarget(null);
    setDragValidation(null);
  }, [dragOverTarget, dragValidation, placeNodeInTarget, nodes, keyPressed, onConnect, setDragState]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isDragOver: dragOverNodeId === node.id,
            dragValidation: dragOverNodeId === node.id ? dragValidation : undefined,
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={snapToGrid}
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2 },
        }}
        className={isDragActive ? 'dragging' : ''}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        <Panel position="top-right" className="space-x-2">
          <Button
            onClick={() => setSnapToGrid(!snapToGrid)}
            size="sm"
            variant={snapToGrid ? 'default' : 'outline'}
            title="Toggle grid snapping"
          >
            <Grid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          {onExport && (
            <Button
              onClick={onExport}
              size="sm"
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          <Button
            onClick={clearDesign}
            size="sm"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </Panel>
        
        {/* Drag Instructions Panel */}
        {isDragActive && (
          <Panel position="bottom-center" className="bg-white shadow-lg rounded-lg p-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Move className="w-4 h-4" />
                <span>Drag to move</span>
              </div>
              <div>Ctrl+Drag: Duplicate</div>
              <div>Alt+Drag: Connect</div>
              <div>Double-click: Expand/Collapse</div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export function DesignCanvas(props: DesignCanvasProps) {
  return (
    <ReactFlowProvider>
      <DesignCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

