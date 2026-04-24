import { RouteNode } from "./tree";

export interface ComplexityScore {
  path: string;
  dynamicSegments: number;
  catchAllSegments: number;
  optionalSegments: number;
  depth: number;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
}

export interface ComplexityReport {
  entries: ComplexityScore[];
  averageScore: number;
  maxScore: number;
  minScore: number;
}

export function scoreComplexity(path: string, depth: number): ComplexityScore {
  const segments = path.split("/").filter(Boolean);
  const dynamicSegments = segments.filter(
    (s) => s.startsWith("[") && !s.startsWith("[...") && !s.startsWith("[[")
  ).length;
  const catchAllSegments = segments.filter((s) => s.startsWith("[...")).length;
  const optionalSegments = segments.filter((s) => s.startsWith("[[")).length;

  const score =
    dynamicSegments * 2 +
    catchAllSegments * 4 +
    optionalSegments * 3 +
    depth;

  const grade =
    score <= 2 ? "A" : score <= 5 ? "B" : score <= 8 ? "C" : score <= 12 ? "D" : "F";

  return { path, dynamicSegments, catchAllSegments, optionalSegments, depth, score, grade };
}

export function buildComplexityReport(
  nodes: RouteNode[]
): ComplexityReport {
  const entries = nodes.map((n) => scoreComplexity(n.path, n.depth ?? 0));
  if (entries.length === 0) {
    return { entries: [], averageScore: 0, maxScore: 0, minScore: 0 };
  }
  const scores = entries.map((e) => e.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return {
    entries,
    averageScore,
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
  };
}

export function formatComplexityReport(report: ComplexityReport): string {
  const lines: string[] = ["Route Complexity Report", "-".repeat(40)];
  for (const e of report.entries) {
    lines.push(
      `[${e.grade}] ${e.path.padEnd(40)} score=${e.score} depth=${e.depth} dyn=${e.dynamicSegments} catch=${e.catchAllSegments} opt=${e.optionalSegments}`
    );
  }
  lines.push("-".repeat(40));
  lines.push(
    `avg=${report.averageScore}  max=${report.maxScore}  min=${report.minScore}  total=${report.entries.length}`
  );
  return lines.join("\n");
}
