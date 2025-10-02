import { SystemNode, NodeType, DragValidationResult, PlacementRules } from '@/types';
import { getComponentMetadata } from '@/data/components';

export class DragValidator {
  
  /**
   * Validates if a dragged node can be placed on/in a target node
   */
  static validatePlacement(
    draggedNode: SystemNode,
    targetNode: SystemNode,
    allNodes: SystemNode[]
  ): DragValidationResult {
    const draggedType = draggedNode.data.type;
    const targetType = targetNode.data.type;
    
    const targetMetadata = getComponentMetadata(targetType);
    const draggedMetadata = getComponentMetadata(draggedType);
    
    if (!targetMetadata?.placementRules || !draggedMetadata?.placementRules) {
      return {
        isValid: false,
        reason: 'Missing placement rules for node types',
      };
    }

    // Check if dragged node can be placed "in" target
    const canPlaceIn = this.canPlaceIn(draggedType, targetMetadata.placementRules, targetNode, allNodes);
    if (canPlaceIn.isValid) {
      return {
        isValid: true,
        placementType: 'in',
        targetNodeId: targetNode.id,
      };
    }

    // Check if dragged node can be placed "on" target
    const canPlaceOn = this.canPlaceOn(draggedType, targetMetadata.placementRules, targetNode, allNodes);
    if (canPlaceOn.isValid) {
      return {
        isValid: true,
        placementType: 'on',
        targetNodeId: targetNode.id,
      };
    }

    return {
      isValid: false,
      reason: canPlaceIn.reason || canPlaceOn.reason || 'Invalid placement',
    };
  }

  /**
   * Check if a node can be placed inside another node
   */
  private static canPlaceIn(
    draggedType: NodeType,
    targetRules: PlacementRules,
    targetNode: SystemNode,
    allNodes: SystemNode[]
  ): DragValidationResult {
    // Check if target accepts this type "in"
    if (!targetRules.acceptsIn?.includes(draggedType)) {
      return {
        isValid: false,
        reason: `${targetNode.data.label} cannot contain ${draggedType}`,
      };
    }

    // Check maximum children limit
    const currentChildren = this.getDirectChildren(targetNode, allNodes);
    if (targetRules.maxChildren && currentChildren.length >= targetRules.maxChildren) {
      return {
        isValid: false,
        reason: `${targetNode.data.label} has reached maximum capacity (${targetRules.maxChildren})`,
      };
    }

    // Check nesting depth
    const nestingDepth = this.getNestingDepth(targetNode, allNodes);
    const maxDepth = targetRules.maxDepth || 3;
    if (nestingDepth >= maxDepth) {
      return {
        isValid: false,
        reason: `Maximum nesting depth (${maxDepth}) exceeded`,
      };
    }

    return { isValid: true };
  }

  /**
   * Check if a node can be placed on another node (attachment/overlay)
   */
  private static canPlaceOn(
    draggedType: NodeType,
    targetRules: PlacementRules,
    targetNode: SystemNode,
    allNodes: SystemNode[]
  ): DragValidationResult {
    // Check if target accepts this type "on"
    if (!targetRules.acceptsOn?.includes(draggedType)) {
      return {
        isValid: false,
        reason: `${targetNode.data.label} cannot have ${draggedType} attached`,
      };
    }

    // Check if this type is already "on" the target
    const existingAttachments = this.getAttachedNodes(targetNode, allNodes, 'on');
    const hasConflict = existingAttachments.some(node => node.data.type === draggedType);
    
    if (hasConflict) {
      return {
        isValid: false,
        reason: `${targetNode.data.label} already has a ${draggedType} attached`,
      };
    }

    return { isValid: true };
  }

  /**
   * Get direct children of a node
   */
  private static getDirectChildren(parentNode: SystemNode, allNodes: SystemNode[]): SystemNode[] {
    return allNodes.filter(node => node.data.parentId === parentNode.id);
  }

  /**
   * Get nodes attached to a parent with specific placement type
   */
  private static getAttachedNodes(
    parentNode: SystemNode, 
    allNodes: SystemNode[], 
    placement: 'in' | 'on'
  ): SystemNode[] {
    return allNodes.filter(node => 
      node.data.parentId === parentNode.id && 
      node.data.placement === placement
    );
  }

  /**
   * Calculate nesting depth from root
   */
  private static getNestingDepth(node: SystemNode, allNodes: SystemNode[]): number {
    if (!node.data.parentId) return 0;
    
    const parent = allNodes.find(n => n.id === node.data.parentId);
    if (!parent) return 0;
    
    return 1 + this.getNestingDepth(parent, allNodes);
  }

  /**
   * Find all nodes within a certain distance from a point (for hover detection)
   */
  static findNodesInRange(
    position: { x: number; y: number },
    nodes: SystemNode[],
    range: number = 50
  ): SystemNode[] {
    return nodes.filter(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - position.x, 2) + 
        Math.pow(node.position.y - position.y, 2)
      );
      return distance <= range;
    });
  }

  /**
   * Check if two nodes can connect based on their types
   */
  static canConnect(sourceType: NodeType, targetType: NodeType): boolean {
    const sourceMetadata = getComponentMetadata(sourceType);
    const targetMetadata = getComponentMetadata(targetType);

    // Check explicit canConnectTo rules
    if (sourceMetadata?.placementRules?.canConnectTo) {
      return sourceMetadata.placementRules.canConnectTo.includes(targetType);
    }

    // Check cannotConnectTo rules (legacy support)
    if (sourceMetadata?.allowedConnections?.cannotConnectTo) {
      return !sourceMetadata.allowedConnections.cannotConnectTo.includes(targetType);
    }

    return true; // Default allow connection
  }

  /**
   * Get visual feedback style for a target node during drag
   */
  static getHoverStyle(validationResult: DragValidationResult): string {
    if (validationResult.isValid) {
      return 'shadow-inner border-2 border-emerald-400 bg-emerald-50 scale-105';
    } else {
      return 'border-2 border-rose-400 bg-rose-50 animate-pulse';
    }
  }

  /**
   * Calculate the position for a child node within its parent
   */
  static calculateChildPosition(
    parentNode: SystemNode,
    childIndex: number,
    placement: 'in' | 'on'
  ): { x: number; y: number } {
    if (placement === 'on') {
      // "On" nodes are attached as badges/overlays
      return {
        x: parentNode.position.x + 20 + (childIndex * 15),
        y: parentNode.position.y - 10,
      };
    } else {
      // "In" nodes are placed inside with grid layout
      const cols = 2;
      const row = Math.floor(childIndex / cols);
      const col = childIndex % cols;
      
      return {
        x: parentNode.position.x + 20 + (col * 140),
        y: parentNode.position.y + 60 + (row * 80),
      };
    }
  }

  /**
   * Validate the entire design for hierarchical correctness
   */
  static validateDesignHierarchy(nodes: SystemNode[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for circular dependencies
    for (const node of nodes) {
      if (this.hasCircularDependency(node, nodes)) {
        errors.push(`Circular dependency detected involving ${node.data.label}`);
      }
    }

    // Check for orphaned children
    for (const node of nodes) {
      if (node.data.parentId && !nodes.find(n => n.id === node.data.parentId)) {
        errors.push(`${node.data.label} has invalid parent reference`);
      }
    }

    // Check placement rules compliance
    for (const node of nodes) {
      if (node.data.parentId) {
        const parent = nodes.find(n => n.id === node.data.parentId);
        if (parent) {
          const validation = this.validatePlacement(node, parent, nodes);
          if (!validation.isValid) {
            errors.push(`${node.data.label} placement error: ${validation.reason}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for circular dependencies in the hierarchy
   */
  private static hasCircularDependency(node: SystemNode, allNodes: SystemNode[]): boolean {
    const visited = new Set<string>();
    let current = node;

    while (current.data.parentId) {
      if (visited.has(current.id)) {
        return true; // Circular dependency found
      }
      visited.add(current.id);

      const parent = allNodes.find(n => n.id === current.data.parentId);
      if (!parent) break;

      current = parent;
    }

    return false;
  }
}
