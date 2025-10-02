'use client';

import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { SystemNodeData, NodeType } from '@/types';
import { 
  User, Globe, Scale, Server, Database, Zap, 
  ListOrdered, Rss, HardDrive, LineChart, Timer,
  ChevronDown, ChevronRight, Layers, Badge as BadgeIcon,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDesignStore } from '@/stores/design-store';

const iconMap: Record<NodeType, LucideIcon> = {
  [NodeType.CLIENT]: User,
  [NodeType.CDN]: Globe,
  [NodeType.API_GATEWAY]: Server,
  [NodeType.LOAD_BALANCER]: Scale,
  [NodeType.SERVICE]: Server,
  [NodeType.DATABASE]: Database,
  [NodeType.CACHE]: Zap,
  [NodeType.QUEUE]: ListOrdered,
  [NodeType.PUBSUB]: Rss,
  [NodeType.OBJECT_STORAGE]: HardDrive,
  [NodeType.METRICS]: LineChart,
  [NodeType.RATE_LIMITER]: Timer,
};

const colorMap: Record<NodeType, string> = {
  [NodeType.CLIENT]: 'bg-blue-100 border-blue-400 text-blue-700',
  [NodeType.CDN]: 'bg-purple-100 border-purple-400 text-purple-700',
  [NodeType.API_GATEWAY]: 'bg-green-100 border-green-400 text-green-700',
  [NodeType.LOAD_BALANCER]: 'bg-green-100 border-green-400 text-green-700',
  [NodeType.RATE_LIMITER]: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  [NodeType.SERVICE]: 'bg-indigo-100 border-indigo-400 text-indigo-700',
  [NodeType.DATABASE]: 'bg-orange-100 border-orange-400 text-orange-700',
  [NodeType.CACHE]: 'bg-red-100 border-red-400 text-red-700',
  [NodeType.OBJECT_STORAGE]: 'bg-pink-100 border-pink-400 text-pink-700',
  [NodeType.QUEUE]: 'bg-teal-100 border-teal-400 text-teal-700',
  [NodeType.PUBSUB]: 'bg-cyan-100 border-cyan-400 text-cyan-700',
  [NodeType.METRICS]: 'bg-gray-100 border-gray-400 text-gray-700',
};

interface SystemNodeProps extends NodeProps<SystemNodeData> {
  isDragOver?: boolean;
  dragValidation?: { isValid: boolean; reason?: string };
}

export function SystemNode({ 
  id, 
  data, 
  selected, 
  isDragOver, 
  dragValidation 
}: SystemNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { nodes, toggleNodeCollapse, getNodeChildren } = useDesignStore();
  
  const Icon = iconMap[data.type];
  const colorClass = colorMap[data.type];
  const hasChildren = data.childrenIds && data.childrenIds.length > 0;
  const isCollapsed = data.isCollapsed;
  const isParent = hasChildren;
  const isChild = !!data.parentId;
  const placement = data.placement;
  
  const handleDoubleClick = useCallback(() => {
    if (hasChildren) {
      toggleNodeCollapse(id);
    }
  }, [hasChildren, id, toggleNodeCollapse]);

  const getNodeStyle = () => {
    const baseClasses = [
      'px-4 py-3 rounded-lg border-2 shadow-md min-w-[120px]',
      'cursor-pointer relative',
      colorClass
    ];
    
    const stateClasses = [];
    
    // Selection state
    if (selected) {
      stateClasses.push('ring-2 ring-offset-2 ring-blue-500');
    }
    
    // Parent/children states
    if (isParent) {
      stateClasses.push('has-children');
      if (isCollapsed) {
        stateClasses.push('collapsed');
      }
    }
    
    // Drag validation feedback with CSS animations
    if (isDragOver && dragValidation) {
      if (dragValidation.isValid) {
        stateClasses.push('valid-drop-target');
      } else {
        stateClasses.push('invalid-drop-target');
      }
    }
    
    // Child node styling
    if (isChild) {
      if (placement === 'on') {
        stateClasses.push('child-on');
      } else if (placement === 'in') {
        stateClasses.push('child-in');
      }
    }
    
    return [...baseClasses, ...stateClasses].join(' ');
  };

  const renderAttachedNodes = () => {
    if (!hasChildren || isCollapsed) return null;
    
    const children = getNodeChildren(id);
    const attachedNodes = children.filter(child => child.data.placement === 'on');
    
    return attachedNodes.map((child, index) => (
      <div
        key={child.id}
        className="absolute -top-2 -right-2 z-20"
        style={{
          transform: `translate(${index * 12}px, ${index * 12}px)`,
        }}
      >
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center shadow-sm">
          <BadgeIcon className="w-3 h-3" />
        </div>
      </div>
    ));
  };

  const renderCollapseButton = () => {
    if (!hasChildren) return null;
    
    const CollapseIcon = isCollapsed ? ChevronRight : ChevronDown;
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleNodeCollapse(id);
        }}
        className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 z-10"
      >
        <CollapseIcon className="w-3 h-3" />
      </button>
    );
  };

  const renderNestingIndicator = () => {
    if (!isParent) return null;
    
    return (
      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
        <Layers className="w-2 h-2" />
      </div>
    );
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Collapse/Expand Button */}
      {renderCollapseButton()}
      
      {/* Main Node */}
      <div className={cn(getNodeStyle())}>
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400"
        />
        
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{data.label}</span>
              {hasChildren && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                  {data.childrenIds?.length}
                </span>
              )}
            </div>
            {data.description && (
              <span className="text-xs opacity-75 line-clamp-1">{data.description}</span>
            )}
            {isDragOver && dragValidation && !dragValidation.isValid && (
              <span className="text-xs text-rose-600 mt-1">
                {dragValidation.reason}
              </span>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400"
        />
      </div>
      
      {/* Nesting Indicator */}
      {renderNestingIndicator()}
      
      {/* Attached Nodes */}
      {renderAttachedNodes()}
      
      {/* Drop Zone Overlay for Drag Operations */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 bg-opacity-20 pointer-events-none z-5" />
      )}
    </div>
  );
}

