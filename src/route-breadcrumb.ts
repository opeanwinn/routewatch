import type { RouteNode } from "./tree";

export interface BreadcrumbEntry {
  path: string;
  segments: string[];
  depth: number;
  isDynamic: boolean;
}

export interface BreadcrumbReport {
  entries: BreadcrumbEntry[];
  maxDepth: number;
  dynamicCount: number;
}

function collectPaths(node: RouteNode, current: string[] = []): BreadcrumbEntry[] {
  const segments = node.name === "/" ? [] : [...current, node.name];
  const path = segments.length === 0 ? "/" : "/" + segments.join("/");
  const isDynamic = segments.some((s) => s.startsWith("["));

  const entry: BreadcrumbEntry = {
    path,
    segments: segments.length === 0 ? ["/"] : segments,
    depth: segments.length,
    isDynamic,
  };

  const children = (node.children ?? []).flatMap((child) =>
    collectPaths(child, segments)
  );

  return [entry, ...children];
}

export function buildBreadcrumbReport(root: RouteNode): BreadcrumbReport {
  const entries = collectPaths(root);
  const maxDepth = entries.reduce((m, e) => Math.max(m, e.depth), 0);
  const dynamicCount = entries.filter((e) => e.isDynamic).length;
  return { entries, maxDepth, dynamicCount };
}

export function formatBreadcrumbReport(report: BreadcrumbReport): string {
  const lines: string[] = [];
  lines.push(`Breadcrumb Report (${report.entries.length} routes, max depth: ${report.maxDepth})`);
  lines.push("");

  for (const entry of report.entries) {
    const crumb = entry.segments.join(" > ");
    const tag = entry.isDynamic ? " [dynamic]" : "";
    lines.push(`  ${entry.path.padEnd(40)} ${crumb}${tag}`);
  }

  lines.push("");
  lines.push(`Dynamic routes: ${report.dynamicCount}`);
  return lines.join("\n");
}
