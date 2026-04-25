import { RouteWeight, buildWeightReport } from './route-weight';
import { RouteNode } from './tree';

export interface WeightBucket {
  label: string;
  min: number;
  max: number;
  routes: RouteWeight[];
}

export function buildWeightMap(root: RouteNode, bucketSize = 3): WeightBucket[] {
  const { routes } = buildWeightReport(root);
  if (routes.length === 0) return [];

  const maxWeight = routes[0].weight;
  const buckets: WeightBucket[] = [];

  for (let min = 0; min <= maxWeight; min += bucketSize) {
    const max = min + bucketSize - 1;
    const matching = routes.filter(r => r.weight >= min && r.weight <= max);
    if (matching.length > 0) {
      buckets.push({ label: `${min}-${max}`, min, max, routes: matching });
    }
  }

  return buckets;
}

export function formatWeightMap(buckets: WeightBucket[]): string {
  if (buckets.length === 0) return 'No routes found.';
  const lines: string[] = ['Route Weight Distribution', '========================='];
  for (const bucket of buckets) {
    const bar = '█'.repeat(bucket.routes.length);
    lines.push(`  [${bucket.label.padEnd(7)}] ${bar} (${bucket.routes.length})`);
    for (const r of bucket.routes) {
      lines.push(`             ${r.path}`);
    }
  }
  return lines.join('\n');
}
