import * as fs from 'fs';
import * as path from 'path';
import { formatOutput } from './formatter';
import { RouteNode } from './tree';
import { DiffResult } from './differ';

export interface ExportOptions {
  format: 'json' | 'markdown' | 'text';
  outputPath: string;
  pretty?: boolean;
}

export function resolveOutputPath(outputPath: string): string {
  return path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);
}

export function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function exportRoutes(
  tree: RouteNode,
  diff: DiffResult | null,
  options: ExportOptions
): void {
  const resolved = resolveOutputPath(options.outputPath);
  ensureDir(resolved);
  const content = formatOutput(tree, diff, options.format, options.pretty ?? false);
  fs.writeFileSync(resolved, content, 'utf-8');
}

export function exportToString(
  tree: RouteNode,
  diff: DiffResult | null,
  format: 'json' | 'markdown' | 'text',
  pretty = false
): string {
  return formatOutput(tree, diff, format, pretty);
}
