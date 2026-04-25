import { RouteNode } from './tree';

export interface Cluster {
  id: string;
  label: string;
  paths: string[];
}

export interface ClusterReport {
  clusters: Cluster[];
  unclustered: string[];
  total: number;
}

function collectPaths(node: RouteNode, base = ''): string[] {
  const current = base ? `${base}/${node.name}` : node.name;
  const results: string[] = [current];
  for (const child of node.children ?? []) {
    results.push(...collectPaths(child, current));
  }
  return results;
}

function topSegment(path: string): string {
  const parts = path.replace(/^\//, '').split('/');
  return parts[0] ?? '';
}

export function clusterByTopSegment(paths: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const p of paths) {
    const seg = topSegment(p);
    if (!seg) continue;
    if (!map.has(seg)) map.set(seg, []);
    map.get(seg)!.push(p);
  }
  return map;
}

export function buildClusterReport(root: RouteNode): ClusterReport {
  const paths = collectPaths(root);
  const grouped = clusterByTopSegment(paths);
  const clusters: Cluster[] = [];
  const unclustered: string[] = [];

  for (const [seg, members] of grouped.entries()) {
    if (members.length === 1) {
      unclustered.push(members[0]);
    } else {
      clusters.push({ id: seg, label: `/${seg}`, paths: members });
    }
  }

  return { clusters, unclustered, total: paths.length };
}

export function formatClusterReport(report: ClusterReport): string {
  const lines: string[] = [];
  lines.push(`Route Clusters (${report.clusters.length} clusters, ${report.total} total routes)`);
  lines.push('');
  for (const cluster of report.clusters) {
    lines.push(`  ${cluster.label}  (${cluster.paths.length} routes)`);
    for (const p of cluster.paths) {
      lines.push(`    - ${p}`);
    }
  }
  if (report.unclustered.length > 0) {
    lines.push('');
    lines.push(`  Unclustered (${report.unclustered.length}):`);
    for (const p of report.unclustered) {
      lines.push(`    - ${p}`);
    }
  }
  return lines.join('\n');
}
