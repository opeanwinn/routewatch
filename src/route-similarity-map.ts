import { RouteNode } from './tree';
import { scoreSimilarity, collectPaths } from './route-similarity';

export interface SimilarityMapEntry {
  path: string;
  topMatch: string | null;
  topScore: number;
  cluster: number;
}

export type SimilarityMap = SimilarityMapEntry[];

/**
 * Assigns each route to a similarity cluster using a greedy union approach.
 * Routes with score >= threshold are grouped together.
 */
export function buildSimilarityMap(node: RouteNode, threshold = 0.6): SimilarityMap {
  const paths = collectPaths(node);
  const clusterOf: Record<string, number> = {};
  let nextCluster = 0;

  for (const p of paths) {
    if (clusterOf[p] === undefined) clusterOf[p] = nextCluster++;
  }

  const topMatch: Record<string, { path: string; score: number }> = {};

  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const { score } = scoreSimilarity(paths[i], paths[j]);
      if (score >= threshold) {
        // merge clusters
        const ca = clusterOf[paths[i]];
        const cb = clusterOf[paths[j]];
        if (ca !== cb) {
          for (const k of paths) {
            if (clusterOf[k] === cb) clusterOf[k] = ca;
          }
        }
        // track top match
        if (!topMatch[paths[i]] || score > topMatch[paths[i]].score) {
          topMatch[paths[i]] = { path: paths[j], score };
        }
        if (!topMatch[paths[j]] || score > topMatch[paths[j]].score) {
          topMatch[paths[j]] = { path: paths[i], score };
        }
      }
    }
  }

  return paths.map(p => ({
    path: p,
    topMatch: topMatch[p]?.path ?? null,
    topScore: topMatch[p]?.score ?? 0,
    cluster: clusterOf[p],
  }));
}

export function formatSimilarityMap(map: SimilarityMap): string {
  const clusters = new Map<number, SimilarityMapEntry[]>();
  for (const entry of map) {
    if (!clusters.has(entry.cluster)) clusters.set(entry.cluster, []);
    clusters.get(entry.cluster)!.push(entry);
  }

  const lines: string[] = [];
  for (const [id, entries] of clusters) {
    if (entries.length === 1) continue;
    lines.push(`Cluster ${id}:`);
    for (const e of entries) {
      const match = e.topMatch ? ` → best match: ${e.topMatch} (${e.topScore})` : '';
      lines.push(`  ${e.path}${match}`);
    }
  }

  return lines.length ? lines.join('\n') : 'No similarity clusters found.';
}
