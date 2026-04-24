import { RouteNode } from "./tree";

export interface RouteDep {
  from: string;
  to: string;
  kind: "layout" | "page" | "loading" | "error" | "template";
}

export interface RouteDepsReport {
  deps: RouteDep[];
  orphans: string[];
  shared: string[];
}

function collectPaths(node: RouteNode, acc: string[] = []): string[] {
  acc.push(node.path);
  for (const child of node.children ?? []) collectPaths(child, acc);
  return acc;
}

export function buildDepsFromTree(root: RouteNode): RouteDep[] {
  const deps: RouteDep[] = [];

  function walk(node: RouteNode, parentPath: string | null): void {
    if (parentPath !== null) {
      const kind = (node.type as RouteDep["kind"]) ?? "page";
      deps.push({ from: parentPath, to: node.path, kind });
    }
    for (const child of node.children ?? []) walk(child, node.path);
  }

  walk(root, null);
  return deps;
}

export function findOrphans(deps: RouteDep[], allPaths: string[]): string[] {
  const targets = new Set(deps.map((d) => d.to));
  const sources = new Set(deps.map((d) => d.from));
  return allPaths.filter((p) => !targets.has(p) && !sources.has(p));
}

export function findSharedLayouts(deps: RouteDep[]): string[] {
  const count: Record<string, number> = {};
  for (const dep of deps) {
    if (dep.kind === "layout") {
      count[dep.from] = (count[dep.from] ?? 0) + 1;
    }
  }
  return Object.entries(count)
    .filter(([, n]) => n > 1)
    .map(([p]) => p);
}

export function buildRouteDepsReport(root: RouteNode): RouteDepsReport {
  const allPaths = collectPaths(root);
  const deps = buildDepsFromTree(root);
  const orphans = findOrphans(deps, allPaths);
  const shared = findSharedLayouts(deps);
  return { deps, orphans, shared };
}

export function formatRouteDepsReport(report: RouteDepsReport): string {
  const lines: string[] = [];
  lines.push(`Dependencies: ${report.deps.length}`);
  if (report.shared.length) {
    lines.push(`Shared layouts: ${report.shared.join(", ")}`);
  }
  if (report.orphans.length) {
    lines.push(`Orphaned routes: ${report.orphans.join(", ")}`);
  }
  for (const dep of report.deps) {
    lines.push(`  ${dep.from} -> ${dep.to} [${dep.kind}]`);
  }
  return lines.join("\n");
}
