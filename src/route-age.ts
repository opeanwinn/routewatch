import { RouteNode } from './tree';
import { HistoryEntry } from './history';

export interface RouteAgeEntry {
  path: string;
  firstSeen: string;
  lastSeen: string;
  ageDays: number;
  changeCount: number;
}

export interface RouteAgeReport {
  entries: RouteAgeEntry[];
  oldest: RouteAgeEntry | null;
  newest: RouteAgeEntry | null;
  averageAgeDays: number;
}

export function collectPaths(node: RouteNode, paths: string[] = []): string[] {
  paths.push(node.path);
  for (const child of node.children ?? []) {
    collectPaths(child, paths);
  }
  return paths;
}

export function buildAgeReport(
  node: RouteNode,
  history: HistoryEntry[]
): RouteAgeReport {
  const paths = collectPaths(node);
  const now = Date.now();

  const entries: RouteAgeEntry[] = paths.map((p) => {
    const appearances = history.filter((h) =>
      (h.routes ?? []).includes(p)
    );
    const timestamps = appearances
      .map((h) => new Date(h.timestamp).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    const firstMs = timestamps[0] ?? now;
    const lastMs = timestamps[timestamps.length - 1] ?? now;
    const ageDays = Math.round((now - firstMs) / (1000 * 60 * 60 * 24));

    return {
      path: p,
      firstSeen: new Date(firstMs).toISOString().slice(0, 10),
      lastSeen: new Date(lastMs).toISOString().slice(0, 10),
      ageDays,
      changeCount: appearances.length,
    };
  });

  const sorted = [...entries].sort((a, b) => b.ageDays - a.ageDays);
  const oldest = sorted[0] ?? null;
  const newest = sorted[sorted.length - 1] ?? null;
  const averageAgeDays =
    entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.ageDays, 0) / entries.length)
      : 0;

  return { entries, oldest, newest, averageAgeDays };
}

export function formatAgeReport(report: RouteAgeReport): string {
  const lines: string[] = ['Route Age Report', '================'];
  for (const e of report.entries) {
    lines.push(
      `  ${e.path.padEnd(40)} age: ${String(e.ageDays).padStart(4)}d  changes: ${e.changeCount}  first: ${e.firstSeen}`
    );
  }
  lines.push('');
  lines.push(`Oldest : ${report.oldest?.path ?? 'n/a'} (${report.oldest?.ageDays ?? 0}d)`);
  lines.push(`Newest : ${report.newest?.path ?? 'n/a'} (${report.newest?.ageDays ?? 0}d)`);
  lines.push(`Average: ${report.averageAgeDays}d`);
  return lines.join('\n');
}
