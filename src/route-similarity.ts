import { RouteNode } from './tree';

export interface SimilarityPair {
  a: string;
  b: string;
  score: number;
  reasons: string[];
}

export interface SimilarityReport {
  pairs: SimilarityPair[];
  threshold: number;
}

function segmentsOf(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function isParam(seg: string): boolean {
  return seg.startsWith('[') && seg.endsWith(']');
}

function segmentSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (isParam(a) && isParam(b)) return 0.9;
  if (isParam(a) || isParam(b)) return 0.5;
  return 0;
}

export function scoreSimilarity(pathA: string, pathB: string): { score: number; reasons: string[] } {
  const segsA = segmentsOf(pathA);
  const segsB = segmentsOf(pathB);
  const reasons: string[] = [];

  if (segsA.length === 0 && segsB.length === 0) return { score: 1, reasons: [] };

  const maxLen = Math.max(segsA.length, segsB.length);
  let total = 0;

  for (let i = 0; i < maxLen; i++) {
    const sa = segsA[i];
    const sb = segsB[i];
    if (!sa || !sb) continue;
    const s = segmentSimilarity(sa, sb);
    total += s;
    if (s >= 0.9 && sa !== sb) reasons.push(`param shape match at position ${i}`);
    if (s === 1 && sa === sb) reasons.push(`shared segment '${sa}'`);
  }

  const depthDiff = Math.abs(segsA.length - segsB.length);
  if (depthDiff === 0) reasons.push('same depth');

  const score = parseFloat((total / maxLen - depthDiff * 0.05).toFixed(3));
  return { score: Math.max(0, Math.min(1, score)), reasons };
}

export function collectPaths(node: RouteNode, base = ''): string[] {
  const current = base ? `${base}/${node.name}` : node.name;
  const results: string[] = [current];
  for (const child of node.children ?? []) {
    results.push(...collectPaths(child, current));
  }
  return results;
}

export function buildSimilarityReport(node: RouteNode, threshold = 0.6): SimilarityReport {
  const paths = collectPaths(node);
  const pairs: SimilarityPair[] = [];

  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const { score, reasons } = scoreSimilarity(paths[i], paths[j]);
      if (score >= threshold) {
        pairs.push({ a: paths[i], b: paths[j], score, reasons });
      }
    }
  }

  pairs.sort((x, y) => y.score - x.score);
  return { pairs, threshold };
}

export function formatSimilarityReport(report: SimilarityReport): string {
  if (report.pairs.length === 0) {
    return `No similar route pairs found above threshold ${report.threshold}.`;
  }
  const lines: string[] = [`Similar routes (threshold: ${report.threshold}):\n`];
  for (const p of report.pairs) {
    lines.push(`  ${p.a}  <->  ${p.b}  [score: ${p.score}]`);
    for (const r of p.reasons) lines.push(`    • ${r}`);
  }
  return lines.join('\n');
}
