import { RouteNode } from './tree';

export interface RouteMeta {
  path: string;
  segment: string;
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
  isGroup: boolean;
  hasLayout: boolean;
  hasLoading: boolean;
  hasError: boolean;
  depth: number;
}

export interface RouteMetaReport {
  entries: RouteMeta[];
  totalRoutes: number;
  dynamicCount: number;
  catchAllCount: number;
  groupCount: number;
}

function collectPaths(node: RouteNode, prefix = ''): Array<{ node: RouteNode; path: string }> {
  const current = prefix ? `${prefix}/${node.name}` : node.name;
  const results: Array<{ node: RouteNode; path: string }> = [{ node, path: current }];
  for (const child of node.children ?? []) {
    results.push(...collectPaths(child, current));
  }
  return results;
}

export function buildMetaReport(root: RouteNode): RouteMetaReport {
  const all = collectPaths(root);
  const entries: RouteMeta[] = all.map(({ node, path }) => {
    const seg = node.name;
    return {
      path,
      segment: seg,
      isDynamic: seg.startsWith('[') && !seg.startsWith('[...') && !seg.startsWith('[[...'),
      isCatchAll: seg.startsWith('[...'),
      isOptionalCatchAll: seg.startsWith('[[...'),
      isGroup: seg.startsWith('(') && seg.endsWith(')'),
      hasLayout: node.files?.includes('layout') ?? false,
      hasLoading: node.files?.includes('loading') ?? false,
      hasError: node.files?.includes('error') ?? false,
      depth: path.split('/').length - 1,
    };
  });

  return {
    entries,
    totalRoutes: entries.length,
    dynamicCount: entries.filter(e => e.isDynamic || e.isCatchAll || e.isOptionalCatchAll).length,
    catchAllCount: entries.filter(e => e.isCatchAll || e.isOptionalCatchAll).length,
    groupCount: entries.filter(e => e.isGroup).length,
  };
}

export function formatMetaReport(report: RouteMetaReport): string {
  const lines: string[] = [];
  lines.push(`Route Metadata Report (${report.totalRoutes} routes)`);
  lines.push(`  Dynamic: ${report.dynamicCount}  Catch-all: ${report.catchAllCount}  Groups: ${report.groupCount}`);
  lines.push('');
  for (const e of report.entries) {
    const flags = [
      e.isDynamic ? '[dynamic]' : '',
      e.isCatchAll ? '[catch-all]' : '',
      e.isOptionalCatchAll ? '[optional-catch-all]' : '',
      e.isGroup ? '[group]' : '',
      e.hasLayout ? '[layout]' : '',
      e.hasLoading ? '[loading]' : '',
      e.hasError ? '[error]' : '',
    ].filter(Boolean).join(' ');
    lines.push(`  ${e.path}${flags ? '  ' + flags : ''}`);
  }
  return lines.join('\n');
}
