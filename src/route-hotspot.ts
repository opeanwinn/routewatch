import type { RouteNode } from "./tree";

export interface HotspotEntry {
  path: string;
  score: number;
  reasons: string[];
}

export interface HotspotReport {
  entries: HotspotEntry[];
  topN: HotspotEntry[];
}

function collectPaths(node: RouteNode, base = ""): RouteNode[] {
  const full = base ? `${base}/${node.name}` : node.name;
  const results: RouteNode[] = [{ ...node, name: full }];
  for (const child of node.children ?? []) {
    results.push(...collectPaths(child, full));
  }
  return results;
}

export function scoreHotspot(node: RouteNode): HotspotEntry {
  const path = node.name;
  const reasons: string[] = [];
  let score = 0;

  const segments = path.split("/").filter(Boolean);

  const dynamicCount = segments.filter((s) => s.startsWith("[")).length;
  if (dynamicCount > 0) {
    score += dynamicCount * 2;
    reasons.push(`${dynamicCount} dynamic segment(s)`);
  }

  const catchAll = segments.some((s) => s.startsWith("[..."));
  if (catchAll) {
    score += 4;
    reasons.push("catch-all segment");
  }

  const depth = segments.length;
  if (depth > 4) {
    score += depth - 4;
    reasons.push(`deep nesting (${depth} levels)`);
  }

  const hasParallel = segments.some((s) => s.startsWith("@"));
  if (hasParallel) {
    score += 3;
    reasons.push("parallel route");
  }

  const hasIntercepted = segments.some((s) => s.startsWith("("));
  if (hasIntercepted) {
    score += 2;
    reasons.push("intercepted route");
  }

  const childCount = (node.children ?? []).length;
  if (childCount > 5) {
    score += Math.floor(childCount / 2);
    reasons.push(`${childCount} direct children`);
  }

  return { path, score, reasons };
}

export function buildHotspotReport(
  root: RouteNode,
  topN = 5
): HotspotReport {
  const nodes = collectPaths(root);
  const entries = nodes
    .map((n) => scoreHotspot(n))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);

  return { entries, topN: entries.slice(0, topN) };
}

export function formatHotspotReport(report: HotspotReport): string {
  if (report.topN.length === 0) return "No hotspots detected.";
  const lines: string[] = ["Route Hotspots:", ""];
  for (const entry of report.topN) {
    lines.push(`  ${entry.path}  [score: ${entry.score}]`);
    for (const r of entry.reasons) {
      lines.push(`    - ${r}`);
    }
  }
  return lines.join("\n");
}
