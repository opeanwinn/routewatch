import { RouteGraph, GraphEdge } from './graph';

export type GraphExportFormat = 'dot' | 'mermaid' | 'csv';

export function exportAsDot(graph: RouteGraph): string {
  const lines = ['digraph routes {', '  rankdir=LR;'];
  for (const node of graph.nodes) {
    const label = node.replace(/"/g, '\\"');
    lines.push(`  "${label}";`);
  }
  for (const edge of graph.edges) {
    const from = edge.from.replace(/"/g, '\\"');
    const to = edge.to.replace(/"/g, '\\"');
    const style = edge.type === 'sibling' ? ' [style=dashed]' : edge.type === 'dynamic' ? ' [color=blue]' : '';
    lines.push(`  "${from}" -> "${to}"${style};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function exportAsMermaid(graph: RouteGraph): string {
  const lines = ['graph LR'];
  const sanitize = (s: string) => s.replace(/[\[\](){}]/g, '_');
  for (const edge of graph.edges) {
    const from = sanitize(edge.from);
    const to = sanitize(edge.to);
    const arrow = edge.type === 'sibling' ? '---' : '-->';
    lines.push(`  ${from} ${arrow} ${to}`);
  }
  return lines.join('\n');
}

export function exportAsCsv(graph: RouteGraph): string {
  const lines = ['from,to,type'];
  for (const edge of graph.edges) {
    lines.push(`${edge.from},${edge.to},${edge.type}`);
  }
  return lines.join('\n');
}

export function exportGraph(graph: RouteGraph, format: GraphExportFormat): string {
  switch (format) {
    case 'dot': return exportAsDot(graph);
    case 'mermaid': return exportAsMermaid(graph);
    case 'csv': return exportAsCsv(graph);
    default: throw new Error(`Unknown graph export format: ${format}`);
  }
}
