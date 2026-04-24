/**
 * route-pattern.ts
 * Analyze and categorize route segment patterns across the app router tree.
 */

import type { RouteNode } from "./tree";

export type PatternKind =
  | "static"
  | "dynamic"
  | "catch-all"
  | "optional-catch-all"
  | "group"
  | "parallel"
  | "intercepted";

export interface PatternEntry {
  path: string;
  segment: string;
  kind: PatternKind;
}

export interface PatternReport {
  entries: PatternEntry[];
  counts: Record<PatternKind, number>;
  total: number;
}

export function classifyPattern(segment: string): PatternKind {
  if (segment.startsWith("@")) return "parallel";
  if (segment.startsWith("(") && segment.endsWith(")")) return "group";
  if (/^\(\./.test(segment)) return "intercepted";
  if (/^\[\.\.\.\./.test(segment)) return "optional-catch-all";
  if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return "catch-all";
  if (/^\[[^\]]+\]$/.test(segment)) return "dynamic";
  return "static";
}

function walk(node: RouteNode, currentPath: string, entries: PatternEntry[]): void {
  const segment = node.name;
  const fullPath = currentPath ? `${currentPath}/${segment}` : segment;
  const kind = classifyPattern(segment);
  entries.push({ path: fullPath, segment, kind });
  for (const child of node.children ?? []) {
    walk(child, fullPath, entries);
  }
}

export function buildPatternReport(root: RouteNode): PatternReport {
  const entries: PatternEntry[] = [];
  walk(root, "", entries);

  const counts: Record<PatternKind, number> = {
    static: 0,
    dynamic: 0,
    "catch-all": 0,
    "optional-catch-all": 0,
    group: 0,
    parallel: 0,
    intercepted: 0,
  };

  for (const e of entries) {
    counts[e.kind]++;
  }

  return { entries, counts, total: entries.length };
}

export function formatPatternReport(report: PatternReport): string {
  const lines: string[] = ["Route Pattern Analysis", "======================"];
  const kinds = Object.keys(report.counts) as PatternKind[];
  for (const kind of kinds) {
    const count = report.counts[kind];
    if (count > 0) {
      lines.push(`  ${kind.padEnd(22)} ${count}`);
    }
  }
  lines.push("");
  lines.push(`Total segments analyzed: ${report.total}`);
  return lines.join("\n");
}
