import type { RouteNode } from './tree';

export interface PrefixMatch {
  prefix: string;
  paths: string[];
  count: number;
}

export interface PrefixReport {
  matches: PrefixMatch[];
  totalPaths: number;
  uniquePrefixes: number;
}

function collectPaths(node: RouteNode, base = ''): string[] {
  const current = base ? `${base}/${node.name}` : node.name;
  const paths: string[] = [current];
  for (const child of node.children ?? []) {
    paths.push(...collectPaths(child, current));
  }
  return paths;
}

export function findRoutesWithPrefix(paths: string[], prefix: string): string[] {
  const normalized = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return paths.filter(p => {
    const full = p.startsWith('/') ? p : `/${p}`;
    return full === normalized || full.startsWith(`${normalized}/`);
  });
}

export function buildPrefixReport(node: RouteNode, prefixes: string[]): PrefixReport {
  const allPaths = collectPaths(node);
  const matches: PrefixMatch[] = prefixes.map(prefix => ({
    prefix,
    paths: findRoutesWithPrefix(allPaths, prefix),
    count: findRoutesWithPrefix(allPaths, prefix).length,
  }));
  return {
    matches,
    totalPaths: allPaths.length,
    uniquePrefixes: prefixes.length,
  };
}

export function formatPrefixReport(report: PrefixReport): string {
  const lines: string[] = [
    `Route Prefix Report`,
    `Total paths: ${report.totalPaths}  Prefixes checked: ${report.uniquePrefixes}`,
    '',
  ];
  for (const m of report.matches) {
    lines.push(`Prefix: ${m.prefix}  (${m.count} match${m.count !== 1 ? 'es' : ''})`);
    if (m.paths.length === 0) {
      lines.push('  (no matches)');
    } else {
      for (const p of m.paths) {
        lines.push(`  ${p}`);
      }
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
