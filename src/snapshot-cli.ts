import * as path from 'path';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { createSnapshot, saveSnapshot, loadSnapshot, snapshotFileName } from './snapshot';
import { diffRoutes } from './differ';
import { renderDiff } from './renderer';

export interface SnapshotFlags {
  appDir: string;
  branch: string;
  outputDir: string;
  compare?: string;
}

export function parseSnapshotFlags(args: string[]): SnapshotFlags {
  const flags: SnapshotFlags = {
    appDir: 'app',
    branch: 'current',
    outputDir: '.routewatch',
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--app-dir' && args[i + 1]) flags.appDir = args[++i];
    else if (args[i] === '--branch' && args[i + 1]) flags.branch = args[++i];
    else if (args[i] === '--output-dir' && args[i + 1]) flags.outputDir = args[++i];
    else if (args[i] === '--compare' && args[i + 1]) flags.compare = args[++i];
  }
  return flags;
}

export async function runSnapshotCli(flags: SnapshotFlags): Promise<void> {
  const entries = scanAppRouter(flags.appDir);
  const tree = buildTree(entries);
  const snapshot = createSnapshot(flags.branch, flags.appDir, tree);
  const outFile = path.join(flags.outputDir, snapshotFileName(flags.branch));
  saveSnapshot(snapshot, outFile);
  console.log(`Snapshot saved: ${outFile}`);

  if (flags.compare) {
    const compareFile = path.join(flags.outputDir, snapshotFileName(flags.compare));
    const other = loadSnapshot(compareFile);
    const diff = diffRoutes(other.routes, snapshot.routes);
    console.log(renderDiff(diff));
  }
}
