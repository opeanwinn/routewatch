import { RouteNode } from './tree';

export interface RouteWeight {
  path: string;
  segmentCount: number;
  dynamicCount: number;
  catchAllCount: number;
  optionalCount: number;
  weight: number;
}

export interface WeightReport {
  routes: RouteWeight[];
  heaviest: RouteWeight | null;
  lightest: RouteWeight | null;
  averageWeight: number;
}

export function scoreWeight(path: string): RouteWeight {
  const segments = path.split('/').filter(Boolean);
  const dynamicCount = segments.filter(s => s.startsWith('[') && !s.startsWith('[..') && !s.startsWith('[[...')).length;
  const catchAllCount = segments.filter(s => s.startsWith('[...')).length;
  const optionalCount = segments.filter(s => s.startsWith('[[...')).length;
  const segmentCount = segments.length;
  const weight = segmentCount + dynamicCount * 2 + catchAllCount * 3 + optionalCount * 4;
  return { path, segmentCount, dynamicCount, catchAllCount, optionalCount, weight };
}

function collectPaths(node: RouteNode, prefix = ''): string[] {
  const current = prefix + '/' + node.name;
  const paths: string[] = [node.name !== '__root__' ? current : ''];
  for (const child of node.children ?? []) {
    paths.push(...collectPaths(child, node.name === '__root__' ? '' : current));
  }
  return paths.filter(Boolean);
}

export function buildWeightReport(root: RouteNode): WeightReport {
  const paths = collectPaths(root);
  const routes = paths.map(scoreWeight);
  routes.sort((a, b) => b.weight - a.weight);
  const heaviest = routes[0] ?? null;
  const lightest = routes[routes.length - 1] ?? null;
  const averageWeight = routes.length
    ? routes.reduce((sum, r) => sum + r.weight, 0) / routes.length
    : 0;
  return { routes, heaviest, lightest, averageWeight };
}

export function formatWeightReport(report: WeightReport): string {
  const lines: string[] = ['Route Weight Report', '==================='];
  for (const r of report.routes) {
    lines.push(
      `  ${r.path.padEnd(50)} weight=${r.weight}  segs=${r.segmentCount}  dyn=${r.dynamicCount}  catch=${r.catchAllCount}  opt=${r.optionalCount}`
    );
  }
  lines.push('');
  lines.push(`Heaviest : ${report.heaviest?.path ?? 'n/a'} (${report.heaviest?.weight ?? 0})`);
  lines.push(`Lightest : ${report.lightest?.path ?? 'n/a'} (${report.lightest?.weight ?? 0})`);
  lines.push(`Average  : ${report.averageWeight.toFixed(2)}`);
  return lines.join('\n');
}
