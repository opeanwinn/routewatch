import { RouteNode } from './tree';

export type BoundaryType = 'error' | 'loading' | 'not-found' | 'layout' | 'template';

export interface BoundaryInfo {
  path: string;
  boundaries: BoundaryType[];
  missing: BoundaryType[];
  score: number;
}

export interface BoundaryReport {
  entries: BoundaryInfo[];
  totalRoutes: number;
  fullyProtected: number;
  unprotected: number;
}

const BOUNDARY_FILES: BoundaryType[] = ['error', 'loading', 'not-found', 'layout', 'template'];

function collectPaths(node: RouteNode, base = ''): Array<{ path: string; files: string[] }> {
  const current = base ? `${base}/${node.name}` : node.name;
  const result: Array<{ path: string; files: string[] }> = [];
  if (node.isPage) {
    result.push({ path: current, files: node.files ?? [] });
  }
  for (const child of node.children ?? []) {
    result.push(...collectPaths(child, current));
  }
  return result;
}

export function analyzeBoundaries(root: RouteNode): BoundaryReport {
  const routes = collectPaths(root);
  const entries: BoundaryInfo[] = routes.map(({ path, files }) => {
    const found = BOUNDARY_FILES.filter(b =>
      files.some(f => f === b || f.startsWith(`${b}.`))
    );
    const missing = BOUNDARY_FILES.filter(b => !found.includes(b));
    const score = Math.round((found.length / BOUNDARY_FILES.length) * 100);
    return { path, boundaries: found, missing, score };
  });

  return {
    entries,
    totalRoutes: entries.length,
    fullyProtected: entries.filter(e => e.missing.length === 0).length,
    unprotected: entries.filter(e => e.boundaries.length === 0).length,
  };
}

export function formatBoundaryReport(report: BoundaryReport): string {
  const lines: string[] = [
    `Route Boundary Report`,
    `Total routes : ${report.totalRoutes}`,
    `Fully protected: ${report.fullyProtected}`,
    `Unprotected    : ${report.unprotected}`,
    '',
  ];
  for (const e of report.entries) {
    const badge = e.score === 100 ? '✔' : e.score === 0 ? '✘' : '~';
    lines.push(`${badge} ${e.path} (${e.score}%)`);
    if (e.boundaries.length) lines.push(`  has : ${e.boundaries.join(', ')}`);
    if (e.missing.length)   lines.push(`  miss: ${e.missing.join(', ')}`);
  }
  return lines.join('\n');
}
