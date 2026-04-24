/**
 * matrix.ts — Build a route comparison matrix across multiple branches/snapshots
 */

import type { RouteNode } from './tree';
import { flattenTree } from './tree';

export interface MatrixEntry {
  path: string;
  presence: Record<string, boolean>;
}

export interface RouteMatrix {
  labels: string[];
  entries: MatrixEntry[];
}

/**
 * Build a matrix showing which routes exist in which labeled trees.
 * @param sources - Array of [label, tree] pairs
 */
export function buildMatrix(sources: [string, RouteNode][]):  RouteMatrix {
  const labels = sources.map(([label]) => label);
  const pathSets: Map<string, Set<string>> = new Map();

  for (const [label, tree] of sources) {
    const paths = flattenTree(tree).map((n) => n.path);
    for (const p of paths) {
      if (!pathSets.has(p)) pathSets.set(p, new Set());
      pathSets.get(p)!.add(label);
    }
  }

  const allPaths = Array.from(pathSets.keys()).sort();

  const entries: MatrixEntry[] = allPaths.map((path) => {
    const presence: Record<string, boolean> = {};
    for (const label of labels) {
      presence[label] = pathSets.get(path)?.has(label) ?? false;
    }
    return { path, presence };
  });

  return { labels, entries };
}

/** Return only entries that differ across labels (not present in all or none) */
export function filterMatrixDiffs(matrix: RouteMatrix): MatrixEntry[] {
  return matrix.entries.filter((entry) => {
    const values = Object.values(entry.presence);
    const allTrue = values.every(Boolean);
    const allFalse = values.every((v) => !v);
    return !allTrue && !allFalse;
  });
}

/** Format the matrix as a readable text table */
export function formatMatrix(matrix: RouteMatrix, diffsOnly = false): string {
  const entries = diffsOnly ? filterMatrixDiffs(matrix) : matrix.entries;
  if (entries.length === 0) return '(no routes found)';

  const colWidth = 10;
  const labelRow = matrix.labels.map((l) => l.slice(0, colWidth).padEnd(colWidth)).join('  ');
  const header = `${'Route'.padEnd(40)}  ${labelRow}`;
  const divider = '-'.repeat(header.length);

  const rows = entries.map((entry) => {
    const cols = matrix.labels
      .map((l) => (entry.presence[l] ? '✓' : '✗').padEnd(colWidth))
      .join('  ');
    return `${entry.path.slice(0, 40).padEnd(40)}  ${cols}`;
  });

  return [header, divider, ...rows].join('\n');
}
