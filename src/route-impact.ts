/**
 * route-impact.ts
 *
 * Analyzes the potential impact of route changes by examining which routes
 * share layouts, params, or structural dependencies. Useful for understanding
 * the blast radius of a refactor or rename.
 */

import { RouteNode } from "./tree";

export interface ImpactEntry {
  path: string;
  reason: string;
  severity: "high" | "medium" | "low";
}

export interface ImpactReport {
  target: string;
  affected: ImpactEntry[];
  totalAffected: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

/** Collect all paths from a tree via DFS */
function collectAll(node: RouteNode, out: RouteNode[] = []): RouteNode[] {
  out.push(node);
  for (const child of node.children ?? []) {
    collectAll(child, out);
  }
  return out;
}

/** Extract the shared layout prefix between two paths */
function sharedSegments(a: string, b: string): number {
  const as = a.split("/").filter(Boolean);
  const bs = b.split("/").filter(Boolean);
  let count = 0;
  for (let i = 0; i < Math.min(as.length, bs.length); i++) {
    if (as[i] === bs[i]) count++;
    else break;
  }
  return count;
}

/** Check if a segment is a dynamic param like [id] or [...slug] */
function isDynamic(segment: string): boolean {
  return /^\[/.test(segment);
}

/** Check if two paths share a dynamic param at the same depth */
function sharesDynamicParam(a: string, b: string): boolean {
  const as = a.split("/").filter(Boolean);
  const bs = b.split("/").filter(Boolean);
  for (let i = 0; i < Math.min(as.length, bs.length); i++) {
    if (isDynamic(as[i]) && as[i] === bs[i]) return true;
  }
  return false;
}

/**
 * Analyze which routes in the tree would be impacted if `targetPath` changes.
 * Returns an ImpactReport with affected routes and their severity.
 */
export function analyzeImpact(
  root: RouteNode,
  targetPath: string
): ImpactReport {
  const all = collectAll(root);
  const affected: ImpactEntry[] = [];

  for (const node of all) {
    if (node.path === targetPath) continue;

    const shared = sharedSegments(targetPath, node.path);
    const dynamic = sharesDynamicParam(targetPath, node.path);

    // Child routes are directly affected (high)
    if (node.path.startsWith(targetPath + "/") || node.path === targetPath + "/") {
      affected.push({
        path: node.path,
        reason: "Direct child route",
        severity: "high",
      });
    } else if (targetPath.startsWith(node.path + "/")) {
      // Parent layout route
      affected.push({
        path: node.path,
        reason: "Parent layout",
        severity: "medium",
      });
    } else if (dynamic) {
      affected.push({
        path: node.path,
        reason: "Shares dynamic param segment",
        severity: "medium",
      });
    } else if (shared >= 2) {
      affected.push({
        path: node.path,
        reason: `Shares ${shared} common segments`,
        severity: "low",
      });
    }
  }

  const highCount = affected.filter((e) => e.severity === "high").length;
  const mediumCount = affected.filter((e) => e.severity === "medium").length;
  const lowCount = affected.filter((e) => e.severity === "low").length;

  return {
    target: targetPath,
    affected,
    totalAffected: affected.length,
    highCount,
    mediumCount,
    lowCount,
  };
}

/** Format an ImpactReport as a human-readable string */
export function formatImpactReport(report: ImpactReport): string {
  const lines: string[] = [];
  lines.push(`Impact analysis for: ${report.target}`);
  lines.push(
    `Affected routes: ${report.totalAffected} ` +
      `(high: ${report.highCount}, medium: ${report.mediumCount}, low: ${report.lowCount})`
  );

  if (report.affected.length === 0) {
    lines.push("  No affected routes found.");
    return lines.join("\n");
  }

  const severityIcon: Record<string, string> = {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
  };

  for (const entry of report.affected) {
    const icon = severityIcon[entry.severity] ?? "•";
    lines.push(`  ${icon} ${entry.path}  — ${entry.reason}`);
  }

  return lines.join("\n");
}
