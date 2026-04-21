/**
 * trace.ts — resolve and display the full path trace for a given route segment
 */

import type { RouteNode } from './tree';

export interface TraceStep {
  segment: string;
  type: RouteNode['type'];
  depth: number;
}

export interface TraceResult {
  route: string;
  steps: TraceStep[];
  found: boolean;
}

export function traceRoute(root: RouteNode, targetPath: string): TraceResult {
  const parts = targetPath.replace(/^\//, '').split('/').filter(Boolean);
  const steps: TraceStep[] = [];

  function walk(node: RouteNode, remaining: string[], depth: number): boolean {
    const segment = node.segment ?? '/';
    steps.push({ segment, type: node.type, depth });

    if (remaining.length === 0) return true;

    const [next, ...rest] = remaining;
    const child = node.children?.find(
      (c) => c.segment === next || c.segment === `[${next}]` || c.segment?.startsWith('[')
    );

    if (!child) return false;
    return walk(child, rest, depth + 1);
  }

  const found = walk(root, parts, 0);

  return { route: targetPath || '/', steps, found };
}

export function formatTrace(result: TraceResult): string {
  if (!result.found) {
    return `Route not found: ${result.route}\n`;
  }

  const lines: string[] = [`Trace for: ${result.route}`, ''];

  for (const step of result.steps) {
    const indent = '  '.repeat(step.depth);
    const label = step.depth === 0 ? '(root)' : step.segment;
    lines.push(`${indent}${step.depth === 0 ? '' : '└─ '}${label}  [${step.type}]`);
  }

  return lines.join('\n') + '\n';
}
