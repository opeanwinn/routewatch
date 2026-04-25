import { RouteNode } from "./tree";

export interface EntropyEntry {
  path: string;
  segments: number;
  dynamicCount: number;
  catchAllCount: number;
  optionalCount: number;
  entropy: number;
}

export interface EntropyReport {
  entries: EntropyEntry[];
  averageEntropy: number;
  maxEntropy: number;
  minEntropy: number;
}

function collectPaths(node: RouteNode, current = ""): string[] {
  const full = current + "/" + node.name;
  const results: string[] = [full];
  for (const child of node.children ?? []) {
    results.push(...collectPaths(child, full));
  }
  return results;
}

export function scoreEntropy(routePath: string): EntropyEntry {
  const parts = routePath.split("/").filter(Boolean);
  const dynamicCount = parts.filter(p => p.startsWith("[") && !p.startsWith("[...") && !p.startsWith("[[...")).length;
  const catchAllCount = parts.filter(p => p.startsWith("[...")).length;
  const optionalCount = parts.filter(p => p.startsWith("[[...")).length;
  const segments = parts.length;

  // Entropy: weighted sum of structural complexity factors
  const entropy =
    segments * 1 +
    dynamicCount * 2 +
    catchAllCount * 3 +
    optionalCount * 4;

  return {
    path: routePath,
    segments,
    dynamicCount,
    catchAllCount,
    optionalCount,
    entropy,
  };
}

export function buildEntropyReport(root: RouteNode): EntropyReport {
  const paths = collectPaths(root);
  const entries = paths.map(scoreEntropy);
  const entropies = entries.map(e => e.entropy);
  const averageEntropy =
    entropies.length > 0
      ? entropies.reduce((a, b) => a + b, 0) / entropies.length
      : 0;
  const maxEntropy = entropies.length > 0 ? Math.max(...entropies) : 0;
  const minEntropy = entropies.length > 0 ? Math.min(...entropies) : 0;
  return { entries, averageEntropy, maxEntropy, minEntropy };
}

export function formatEntropyReport(report: EntropyReport): string {
  const lines: string[] = ["Route Entropy Report", "===================="];
  const sorted = [...report.entries].sort((a, b) => b.entropy - a.entropy);
  for (const e of sorted) {
    lines.push(
      `  ${e.path.padEnd(50)} entropy=${e.entropy}  segs=${e.segments}  dyn=${e.dynamicCount}  catch=${e.catchAllCount}  opt=${e.optionalCount}`
    );
  }
  lines.push("");
  lines.push(`Average entropy : ${report.averageEntropy.toFixed(2)}`);
  lines.push(`Max entropy     : ${report.maxEntropy}`);
  lines.push(`Min entropy     : ${report.minEntropy}`);
  return lines.join("\n");
}
