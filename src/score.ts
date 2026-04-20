import { RouteNode } from './tree';
import { collectAll } from './stats';

export interface RouteScore {
  path: string;
  score: number;
  reasons: string[];
}

export interface ScoreOptions {
  penalizeDeepRoutes?: boolean;
  penalizeDynamicSegments?: boolean;
  penalizeCatchAll?: boolean;
  rewardPages?: boolean;
  maxDepth?: number;
}

const DEFAULT_OPTIONS: Required<ScoreOptions> = {
  penalizeDeepRoutes: true,
  penalizeDynamicSegments: true,
  penalizeCatchAll: true,
  rewardPages: true,
  maxDepth: 5,
};

export function scoreRoute(node: RouteNode, options: ScoreOptions = {}): RouteScore {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const reasons: string[] = [];
  let score = 100;

  const segments = node.path.split('/').filter(Boolean);
  const depth = segments.length;

  if (opts.penalizeDeepRoutes && depth > opts.maxDepth) {
    const penalty = (depth - opts.maxDepth) * 10;
    score -= penalty;
    reasons.push(`Deep route (depth ${depth}): -${penalty}`);
  }

  const dynamicSegments = segments.filter(s => s.startsWith('[') && !s.startsWith('[...'));
  if (opts.penalizeDynamicSegments && dynamicSegments.length > 0) {
    const penalty = dynamicSegments.length * 5;
    score -= penalty;
    reasons.push(`Dynamic segments (${dynamicSegments.length}): -${penalty}`);
  }

  const catchAllSegments = segments.filter(s => s.startsWith('[...'));
  if (opts.penalizeCatchAll && catchAllSegments.length > 0) {
    const penalty = catchAllSegments.length * 15;
    score -= penalty;
    reasons.push(`Catch-all segments (${catchAllSegments.length}): -${penalty}`);
  }

  if (opts.rewardPages && node.type === 'page') {
    score += 10;
    reasons.push('Has page file: +10');
  }

  return { path: node.path, score: Math.max(0, score), reasons };
}

export function scoreAllRoutes(root: RouteNode, options: ScoreOptions = {}): RouteScore[] {
  const nodes = collectAll(root);
  return nodes
    .map(node => scoreRoute(node, options))
    .sort((a, b) => a.score - b.score);
}

export function formatScoreResults(scores: RouteScore[], verbose = false): string {
  const lines: string[] = [];
  for (const s of scores) {
    const bar = '█'.repeat(Math.floor(s.score / 10)).padEnd(10, '░');
    lines.push(`${String(s.score).padStart(3)} [${bar}] ${s.path}`);
    if (verbose) {
      for (const r of s.reasons) {
        lines.push(`         • ${r}`);
      }
    }
  }
  return lines.join('\n');
}
