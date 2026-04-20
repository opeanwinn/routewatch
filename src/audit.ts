import { RouteNode } from "./tree";
import { collectPaths } from "./differ";

export interface AuditIssue {
  path: string;
  severity: "warn" | "error";
  message: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  passed: number;
  failed: number;
}

export function auditRoutes(root: RouteNode): AuditResult {
  const issues: AuditIssue[] = [];
  const paths = collectPaths(root);

  for (const p of paths) {
    // Detect deeply nested dynamic segments (potential performance concern)
    const dynamicSegments = (p.match(/\[/g) || []).length;
    if (dynamicSegments > 3) {
      issues.push({
        path: p,
        severity: "warn",
        message: `Route has ${dynamicSegments} dynamic segments — consider flattening`,
      });
    }

    // Detect catch-all inside non-root segments
    if (/\[\.\.\..+\]/.test(p) && p.split("/").length > 3) {
      issues.push({
        path: p,
        severity: "warn",
        message: "Catch-all segment used in deeply nested route",
      });
    }

    // Detect duplicate adjacent segments
    const parts = p.split("/").filter(Boolean);
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i] === parts[i + 1] && !parts[i].startsWith("[")) {
        issues.push({
          path: p,
          severity: "error",
          message: `Duplicate adjacent segment "${parts[i]}" in route`,
        });
      }
    }
  }

  return {
    issues,
    passed: paths.length - new Set(issues.map((i) => i.path)).size,
    failed: new Set(issues.map((i) => i.path)).size,
  };
}

export function formatAuditResult(result: AuditResult): string {
  const lines: string[] = [];
  lines.push(`Audit: ${result.passed} passed, ${result.failed} failed\n`);
  for (const issue of result.issues) {
    const icon = issue.severity === "error" ? "✖" : "⚠";
    lines.push(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.path}`);
    lines.push(`      ${issue.message}`);
  }
  if (result.issues.length === 0) {
    lines.push("  ✔ No issues found.");
  }
  return lines.join("\n");
}
