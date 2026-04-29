import { RouteNode } from './tree';

export interface ParamInfo {
  param: string;
  routes: string[];
  count: number;
  isOptional: boolean;
  isCatchAll: boolean;
}

export interface ParamReport {
  params: ParamInfo[];
  totalParams: number;
  totalRoutes: number;
}

function collectPaths(node: RouteNode, prefix = ''): string[] {
  const current = prefix + '/' + node.segment;
  const results: string[] = [node.segment ? current : '/'];
  for (const child of node.children ?? []) {
    results.push(...collectPaths(child, current === '/' ? '' : current));
  }
  return results;
}

function parseParam(segment: string): { name: string; isOptional: boolean; isCatchAll: boolean } | null {
  const catchAllOptional = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
  if (catchAllOptional) return { name: catchAllOptional[1], isOptional: true, isCatchAll: true };

  const catchAll = segment.match(/^\[\.\.\.(.+)\]$/);
  if (catchAll) return { name: catchAll[1], isOptional: false, isCatchAll: true };

  const dynamic = segment.match(/^\[(.+)\]$/);
  if (dynamic) return { name: dynamic[1], isOptional: false, isCatchAll: false };

  return null;
}

export function buildParamReport(root: RouteNode): ParamReport {
  const paths = collectPaths(root);
  const paramMap = new Map<string, ParamInfo>();

  for (const route of paths) {
    const segments = route.split('/').filter(Boolean);
    for (const seg of segments) {
      const parsed = parseParam(seg);
      if (!parsed) continue;
      const key = parsed.name;
      if (!paramMap.has(key)) {
        paramMap.set(key, { param: key, routes: [], count: 0, isOptional: parsed.isOptional, isCatchAll: parsed.isCatchAll });
      }
      const entry = paramMap.get(key)!;
      entry.routes.push(route);
      entry.count++;
    }
  }

  const params = Array.from(paramMap.values()).sort((a, b) => b.count - a.count);
  return { params, totalParams: params.length, totalRoutes: paths.length };
}

export function formatParamReport(report: ParamReport): string {
  const lines: string[] = [
    `Route Parameters (${report.totalParams} unique, ${report.totalRoutes} routes scanned)`,
    ''
  ];
  for (const p of report.params) {
    const flags = [p.isCatchAll ? 'catch-all' : null, p.isOptional ? 'optional' : null].filter(Boolean).join(', ');
    lines.push(`  [${p.param}]${flags ? ` (${flags})` : ''} — used in ${p.count} route(s)`);
    for (const r of p.routes) {
      lines.push(`    ${r}`);
    }
  }
  return lines.join('\n');
}
