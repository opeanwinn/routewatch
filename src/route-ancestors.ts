import { RouteNode } from "./tree";

export interface AncestorEntry {
  path: string;
  ancestors: string[];
  depth: number;
}

export interface AncestorReport {
  entries: AncestorEntry[];
  deepest: AncestorEntry | null;
  averageDepth: number;
}

function collectPaths(node: RouteNode, current: string[] = [], results: AncestorEntry[] = []): AncestorEntry[] {
  const segPath = node.name === "/" ? "/" : (current.length === 0 ? "/" + node.name : current.join("/") + "/" + node.name);
  const ancestors = current.map((_, i) =>
    i === 0 ? "/" : "/" + current.slice(1, i + 1).join("/")
  );

  results.push({
    path: segPath,
    ancestors,
    depth: current.length,
  });

  const nextCurrent = node.name === "/" ? [""] : [...current, node.name];
  for (const child of node.children ?? []) {
    collectPaths(child, nextCurrent, results);
  }

  return results;
}

export function buildAncestorReport(root: RouteNode): AncestorReport {
  const entries = collectPaths(root);

  const deepest = entries.reduce<AncestorEntry | null>((best, e) =>
    !best || e.depth > best.depth ? e : best, null
  );

  const averageDepth = entries.length
    ? entries.reduce((sum, e) => sum + e.depth, 0) / entries.length
    : 0;

  return { entries, deepest, averageDepth };
}

export function formatAncestorReport(report: AncestorReport): string {
  const lines: string[] = ["Route Ancestor Report", "=" .repeat(40)];

  for (const entry of report.entries) {
    lines.push(`\n${entry.path} (depth: ${entry.depth})`);
    if (entry.ancestors.length > 0) {
      lines.push(`  ancestors: ${entry.ancestors.join(" > ")}`);
    } else {
      lines.push(`  ancestors: (root)`);
    }
  }

  lines.push("");
  lines.push(`Deepest route: ${report.deepest?.path ?? "none"} (depth ${report.deepest?.depth ?? 0})`);
  lines.push(`Average depth: ${report.averageDepth.toFixed(2)}`);

  return lines.join("\n");
}
