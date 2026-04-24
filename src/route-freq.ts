/**
 * route-freq.ts
 * Analyze route access frequency patterns from history entries.
 */

import { HistoryEntry } from "./history";

export interface RouteFrequency {
  path: string;
  count: number;
  lastSeen: string;
  firstSeen: string;
}

export interface FrequencyReport {
  topRoutes: RouteFrequency[];
  totalScans: number;
  uniquePaths: number;
}

export function buildFrequencyMap(
  entries: HistoryEntry[]
): Map<string, RouteFrequency> {
  const map = new Map<string, RouteFrequency>();

  for (const entry of entries) {
    const paths: string[] = (entry as any).paths ?? [];
    for (const p of paths) {
      const existing = map.get(p);
      if (existing) {
        existing.count += 1;
        if (entry.timestamp > existing.lastSeen) {
          existing.lastSeen = entry.timestamp;
        }
        if (entry.timestamp < existing.firstSeen) {
          existing.firstSeen = entry.timestamp;
        }
      } else {
        map.set(p, {
          path: p,
          count: 1,
          lastSeen: entry.timestamp,
          firstSeen: entry.timestamp,
        });
      }
    }
  }

  return map;
}

export function buildFrequencyReport(
  entries: HistoryEntry[],
  topN = 10
): FrequencyReport {
  const map = buildFrequencyMap(entries);
  const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);

  return {
    topRoutes: sorted.slice(0, topN),
    totalScans: entries.length,
    uniquePaths: map.size,
  };
}

export function formatFrequencyReport(report: FrequencyReport): string {
  const lines: string[] = [
    `Route Frequency Report`,
    `Total scans: ${report.totalScans}  Unique paths: ${report.uniquePaths}`,
    "",
    `${"-".repeat(60)}`,
    `${ "Count".padEnd(8) }${ "Last Seen".padEnd(22) }Path`,
    `${"-".repeat(60)}`,
  ];

  for (const r of report.topRoutes) {
    lines.push(
      `${String(r.count).padEnd(8)}${r.lastSeen.slice(0, 19).padEnd(22)}${r.path}`
    );
  }

  if (report.topRoutes.length === 0) {
    lines.push("  (no data)");
  }

  return lines.join("\n");
}
