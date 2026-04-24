import { RouteNode } from './tree';

export interface RouteSizeEntry {
  path: string;
  segmentCount: number;
  isDynamic: boolean;
  isCatchAll: boolean;
  isGroup: boolean;
  score: number;
}

export interface RouteSizeReport {
  entries: RouteSizeEntry[];
  totalRoutes: number;
  avgSegments: number;
  maxSegments: number;
  dynamicCount: number;
  catchAllCount: number;
}

function segmentScore(segment: string): number {
  if (segment.startsWith('[[...')) return 4;
  if (segment.startsWith('[...')) return 3;
  if (segment.startsWith('[')) return 2;
  if (segment.startsWith('(')) return 0;
  return 1;
}

export function analyzeRouteSize(path: string): RouteSizeEntry {
  const segments = path.split('/').filter(Boolean);
  const isDynamic = segments.some(s => s.startsWith('[') && !s.startsWith('[[...'));
  const isCatchAll = segments.some(s => s.startsWith('[...') || s.startsWith('[[...'));
  const isGroup = segments.some(s => s.startsWith('('));
  const score = segments.reduce((acc, s) => acc + segmentScore(s), 0);
  return {
    path,
    segmentCount: segments.filter(s => !s.startsWith('(')).length,
    isDynamic,
    isCatchAll,
    isGroup,
    score,
  };
}

export function buildRouteSizeReport(paths: string[]): RouteSizeReport {
  const entries = paths.map(analyzeRouteSize);
  const total = entries.length;
  const avgSegments = total === 0 ? 0 : entries.reduce((a, e) => a + e.segmentCount, 0) / total;
  const maxSegments = entries.reduce((a, e) => Math.max(a, e.segmentCount), 0);
  const dynamicCount = entries.filter(e => e.isDynamic).length;
  const catchAllCount = entries.filter(e => e.isCatchAll).length;
  return { entries, totalRoutes: total, avgSegments, maxSegments, dynamicCount, catchAllCount };
}

export function formatRouteSizeReport(report: RouteSizeReport): string {
  const lines: string[] = [
    `Route Size Report`,
    `  Total routes   : ${report.totalRoutes}`,
    `  Avg segments   : ${report.avgSegments.toFixed(2)}`,
    `  Max segments   : ${report.maxSegments}`,
    `  Dynamic routes : ${report.dynamicCount}`,
    `  Catch-all      : ${report.catchAllCount}`,
    '',
    'Top complex routes:',
  ];
  const top = [...report.entries].sort((a, b) => b.score - a.score).slice(0, 5);
  for (const e of top) {
    lines.push(`  [${e.score}] ${e.path}`);
  }
  return lines.join('\n');
}
