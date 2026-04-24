import { RouteNode } from './tree';
import { computeStats } from './stats';
import { auditRoutes } from './audit';
import { lintRoutes } from './lint';
import { scoreAllRoutes } from './score';

export interface RouteSummary {
  totalRoutes: number;
  totalPages: number;
  totalLayouts: number;
  totalDynamic: number;
  totalGroups: number;
  maxDepth: number;
  auditIssues: number;
  lintWarnings: number;
  averageScore: number;
}

export function buildSummary(root: RouteNode): RouteSummary {
  const stats = computeStats(root);
  const auditResults = auditRoutes(root);
  const lintResults = lintRoutes(root);
  const scoreResults = scoreAllRoutes(root);

  const totalScore = scoreResults.reduce((sum, r) => sum + r.score, 0);
  const averageScore =
    scoreResults.length > 0
      ? Math.round((totalScore / scoreResults.length) * 100) / 100
      : 0;

  return {
    totalRoutes: stats.totalRoutes,
    totalPages: stats.totalPages,
    totalLayouts: stats.totalLayouts,
    totalDynamic: stats.totalDynamic,
    totalGroups: stats.totalGroups,
    maxDepth: stats.maxDepth,
    auditIssues: auditResults.filter((r) => r.issues.length > 0).length,
    lintWarnings: lintResults.filter((r) => r.messages.length > 0).length,
    averageScore,
  };
}

export function formatSummary(summary: RouteSummary): string {
  const lines: string[] = [
    '=== Route Summary ===',
    `  Total routes   : ${summary.totalRoutes}`,
    `  Pages          : ${summary.totalPages}`,
    `  Layouts        : ${summary.totalLayouts}`,
    `  Dynamic segs   : ${summary.totalDynamic}`,
    `  Route groups   : ${summary.totalGroups}`,
    `  Max depth      : ${summary.maxDepth}`,
    '',
    '=== Quality ===',
    `  Audit issues   : ${summary.auditIssues}`,
    `  Lint warnings  : ${summary.lintWarnings}`,
    `  Average score  : ${summary.averageScore}`,
  ];
  return lines.join('\n');
}
