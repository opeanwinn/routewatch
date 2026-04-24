import { RouteNode } from "./tree";

export interface CoverageResult {
  route: string;
  hasPage: boolean;
  hasLayout: boolean;
  hasLoading: boolean;
  hasError: boolean;
  hasNotFound: boolean;
  score: number;
}

export interface CoverageSummary {
  total: number;
  fullyDefined: number;
  partial: number;
  bare: number;
  averageScore: number;
  results: CoverageResult[];
}

const FILES = ["page", "layout", "loading", "error", "not-found"] as const;

export function computeCoverage(node: RouteNode, path = ""): CoverageResult[] {
  const results: CoverageResult[] = [];
  const current = path ? `${path}/${node.name}` : node.name || "/";

  if (node.type === "page" || (node.children && node.children.length > 0)) {
    const files = node.files ?? [];
    const hasPage = files.includes("page");
    const hasLayout = files.includes("layout");
    const hasLoading = files.includes("loading");
    const hasError = files.includes("error");
    const hasNotFound = files.includes("not-found");

    const score = Math.round(
      ([hasPage, hasLayout, hasLoading, hasError, hasNotFound].filter(Boolean).length / FILES.length) * 100
    );

    results.push({ route: current || "/", hasPage, hasLayout, hasLoading, hasError, hasNotFound, score });
  }

  for (const child of node.children ?? []) {
    results.push(...computeCoverage(child, current));
  }

  return results;
}

export function summarizeCoverage(results: CoverageResult[]): CoverageSummary {
  const total = results.length;
  const fullyDefined = results.filter((r) => r.score === 100).length;
  const bare = results.filter((r) => r.score <= 20).length;
  const partial = total - fullyDefined - bare;
  const averageScore = total === 0 ? 0 : Math.round(results.reduce((s, r) => s + r.score, 0) / total);
  return { total, fullyDefined, partial, bare, averageScore, results };
}

export function formatCoverage(summary: CoverageSummary): string {
  const lines: string[] = [
    `Route Coverage Report`,
    `─────────────────────`,
    `Total routes : ${summary.total}`,
    `Fully defined: ${summary.fullyDefined}`,
    `Partial      : ${summary.partial}`,
    `Bare         : ${summary.bare}`,
    `Avg score    : ${summary.averageScore}%`,
    ``,
  ];
  for (const r of summary.results) {
    const flags = [
      r.hasPage ? "P" : ".",
      r.hasLayout ? "L" : ".",
      r.hasLoading ? "D" : ".",
      r.hasError ? "E" : ".",
      r.hasNotFound ? "N" : ".",
    ].join("");
    lines.push(`  ${flags}  ${r.score.toString().padStart(3)}%  ${r.route}`);
  }
  lines.push(``, `Legend: P=page L=layout D=loading E=error N=not-found`);
  return lines.join("\n");
}
