import { RouteNode } from './tree';
import { loadHistory, HistoryEntry } from './history';

export interface TimelineEntry {
  timestamp: number;
  branch: string;
  added: string[];
  removed: string[];
  total: number;
}

export interface RouteTimeline {
  entries: TimelineEntry[];
  earliest: number;
  latest: number;
}

export function buildTimeline(historyPath: string): RouteTimeline {
  const history = loadHistory(historyPath);
  const entries: TimelineEntry[] = [];

  for (let i = 0; i < history.entries.length; i++) {
    const curr = history.entries[i];
    const prev = history.entries[i - 1];

    const currPaths = new Set(curr.paths);
    const prevPaths = new Set(prev ? prev.paths : []);

    const added = curr.paths.filter(p => !prevPaths.has(p));
    const removed = (prev ? prev.paths : []).filter(p => !currPaths.has(p));

    entries.push({
      timestamp: curr.timestamp,
      branch: curr.branch,
      added,
      removed,
      total: curr.paths.length,
    });
  }

  const timestamps = entries.map(e => e.timestamp);
  return {
    entries,
    earliest: timestamps.length ? Math.min(...timestamps) : 0,
    latest: timestamps.length ? Math.max(...timestamps) : 0,
  };
}

export function formatTimeline(timeline: RouteTimeline): string {
  if (timeline.entries.length === 0) return 'No history entries found.';

  const lines: string[] = ['Route Timeline', '=============='];

  for (const entry of timeline.entries) {
    const date = new Date(entry.timestamp).toISOString().slice(0, 16).replace('T', ' ');
    lines.push(`\n[${date}] branch: ${entry.branch}  total: ${entry.total}`);
    for (const a of entry.added) lines.push(`  + ${a}`);
    for (const r of entry.removed) lines.push(`  - ${r}`);
    if (entry.added.length === 0 && entry.removed.length === 0) {
      lines.push('  (no changes)');
    }
  }

  return lines.join('\n');
}

export function timelineStats(timeline: RouteTimeline): Record<string, number> {
  const totalAdded = timeline.entries.reduce((s, e) => s + e.added.length, 0);
  const totalRemoved = timeline.entries.reduce((s, e) => s + e.removed.length, 0);
  return {
    snapshots: timeline.entries.length,
    totalAdded,
    totalRemoved,
    netChange: totalAdded - totalRemoved,
  };
}
