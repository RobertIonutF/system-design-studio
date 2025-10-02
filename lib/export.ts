import { toPng } from 'html-to-image';
import { SystemNode, SystemEdge, DesignExport, NodeType } from '@/types';

export const exportToPNG = async (element: HTMLElement, filename: string = 'design.png') => {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      filter: (node) => {
        // Filter out React Flow controls and minimap
        if (node?.classList) {
          return !node.classList.contains('react-flow__controls') &&
                 !node.classList.contains('react-flow__minimap');
        }
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
};

export const exportToJSON = (
  nodes: SystemNode[],
  edges: SystemEdge[],
  challengeId?: string,
  filename: string = 'design.json'
) => {
  const exportData: DesignExport = {
    nodes,
    edges,
    metadata: {
      challengeId,
      createdAt: new Date(),
      version: '1.0.0',
    },
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', filename);
  link.click();
};

export const exportToMermaid = (nodes: SystemNode[], edges: SystemEdge[]): string => {
  const lines: string[] = ['graph TD'];
  
  // Add nodes
  nodes.forEach((node) => {
    const id = node.id.replace(/[^a-zA-Z0-9]/g, '_');
    const label = node.data.label;
    
    // Use different shapes for different node types
    let shape = '[]'; // default rectangle
    switch (node.data.type) {
      case NodeType.CLIENT:
        shape = `((${label}))`;
        break;
      case NodeType.DATABASE:
        shape = `[(${label})]`;
        break;
      case NodeType.CACHE:
      case NodeType.QUEUE:
      case NodeType.PUBSUB:
        shape = `{{${label}}}`;
        break;
      default:
        shape = `[${label}]`;
    }
    
    lines.push(`  ${id}${shape}`);
  });

  // Add edges
  edges.forEach((edge) => {
    const source = edge.source.replace(/[^a-zA-Z0-9]/g, '_');
    const target = edge.target.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  ${source} --> ${target}`);
  });

  return lines.join('\n');
};

export const copyMermaidToClipboard = async (mermaidCode: string) => {
  try {
    await navigator.clipboard.writeText(mermaidCode);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw error;
  }
};

