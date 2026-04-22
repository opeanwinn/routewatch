import type { RouteNode } from './tree';

export interface RouteMapEntry {
  path: string;
  type: 'page' | 'layout' | 'loading' | 'error' | 'route' | 'unknown';
  depth: number;
  dynamic: boolean;
  catchAll: boolean;
}

export function classifySegment(segment: string): Pick<RouteMapEntry, 'dynamic' | 'catchAll'> {
  const catchAll = segment.startsWith('[...') || segment.startsWith('[[...');
  const dynamic = catchAll || (segment.startsWith('[') && segment.endsWith(']'));
  return { dynamic, catchAll };
}

export function buildRouteMap(node: RouteNode, basePath = '', depth = 0): RouteMapEntry[] {
  const entries: RouteMapEntry[] = [];
  const currentPath = basePath === '' && node.name === 'app'
    ? ''
    : `${basePath}/${node.name}`.replace(/\/+/g, '/');

  const { dynamic, catchAll } = classifySegment(node.name);

  const typeMap: Record<string, RouteMapEntry['type']> = {
    page: 'page',
    layout: 'layout',
    loading: 'loading',
    error: 'error',
    route: 'route',
  };

  const nodeType: RouteMapEntry['type'] = typeMap[node.type ?? ''] ?? 'unknown';

  if (node.name !== 'app') {
    entries.push({
      path: currentPath || '/',
      type: nodeType,
      depth,
      dynamic,
      catchAll,
    });
  }

  for (const child of node.children ?? []) {
    entries.push(...buildRouteMap(child, currentPath, depth + 1));
  }

  return entries;
}

export function formatRouteMap(entries: RouteMapEntry[]): string {
  const header = `${'PATH'.padEnd(40)} ${'TYPE'.padEnd(10)} ${'DEPTH'.padEnd(6)} DYNAMIC`;
  const divider = '-'.repeat(70);
  const rows = entries.map(e => {
    const flags = [e.dynamic ? 'dynamic' : '', e.catchAll ? 'catch-all' : ''].filter(Boolean).join(', ');
    return `${e.path.padEnd(40)} ${e.type.padEnd(10)} ${String(e.depth).padEnd(6)} ${flags || '-'}`;
  });
  return [header, divider, ...rows].join('\n');
}
