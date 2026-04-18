import * as fs from 'fs';
import * as path from 'path';
import { RouteNode } from './tree';

export interface Snapshot {
  branch: string;
  timestamp: string;
  appDir: string;
  routes: RouteNode;
}

export function createSnapshot(branch: string, appDir: string, routes: RouteNode): Snapshot {
  return {
    branch,
    timestamp: new Date().toISOString(),
    appDir,
    routes,
  };
}

export function saveSnapshot(snapshot: Snapshot, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

export function loadSnapshot(filePath: string): Snapshot {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  if (!data.branch || !data.timestamp || !data.routes) {
    throw new Error(`Invalid snapshot format in: ${filePath}`);
  }
  return data as Snapshot;
}

export function snapshotFileName(branch: string): string {
  const safe = branch.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `routewatch-snapshot-${safe}.json`;
}
