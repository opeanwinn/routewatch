import * as fs from 'fs';
import * as path from 'path';
import { RouteNode } from './snapshot';

export interface HistoryEntry {
  timestamp: string;
  branch: string;
  routeCount: number;
  snapshot: RouteNode;
}

export interface HistoryStore {
  entries: HistoryEntry[];
}

export function emptyHistory(): HistoryStore {
  return { entries: [] };
}

export function addHistoryEntry(
  store: HistoryStore,
  branch: string,
  snapshot: RouteNode
): HistoryStore {
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    branch,
    routeCount: countNodes(snapshot),
    snapshot,
  };
  return { entries: [...store.entries, entry] };
}

export function countNodes(node: RouteNode): number {
  return 1 + (node.children ?? []).reduce((s, c) => s + countNodes(c), 0);
}

export function saveHistory(store: HistoryStore, filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function loadHistory(filePath: string): HistoryStore {
  if (!fs.existsSync(filePath)) return emptyHistory();
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as HistoryStore;
}

export function formatHistory(store: HistoryStore): string {
  if (store.entries.length === 0) return 'No history entries.';
  return store.entries
    .map((e, i) => `[${i + 1}] ${e.timestamp}  branch=${e.branch}  routes=${e.routeCount}`)
    .join('\n');
}

export function pruneHistory(store: HistoryStore, maxEntries: number): HistoryStore {
  const entries = store.entries.slice(-maxEntries);
  return { entries };
}
