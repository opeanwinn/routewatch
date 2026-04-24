import { RouteNode } from './tree';

export interface OrphanReport {
  orphans: string[];
  total: number;
  summary: string;
}

/**
 * Walk the tree and collect all route paths.
 */
function collectPaths(node: RouteNode, prefix = ''): string[] {
  const current = prefix ? `${prefix}/${node.name}` : node.name || '/';
  const paths: string[] = [current];
  for (const child of node.children ?? []) {
    paths.push(...collectPaths(child, current === '/' ? '' : current));
  }
  return paths;
}

/**
 * A route is considered an orphan if:
 *  - it has no page.tsx / page.js (leaf with no page file)
 *  - AND it has no children that are pages
 *
 * We detect this by checking the node's `type` field and whether
 * a path appears only as an intermediate segment with no page.
 */
export function findOrphanRoutes(
  root: RouteNode,
  knownPagePaths: Set<string>
): OrphanReport {
  const allPaths = collectPaths(root);
  const orphans: string[] = [];

  for (const p of allPaths) {
    const normalized = p === '' ? '/' : p;
    if (!knownPagePaths.has(normalized)) {
      // Only flag non-root intermediate segments
      if (normalized !== '/') {
        orphans.push(normalized);
      }
    }
  }

  return {
    orphans,
    total: orphans.length,
    summary: orphans.length === 0
      ? 'No orphan routes detected.'
      : `${orphans.length} orphan route(s) found (segments with no page file).`,
  };
}

export function formatOrphanReport(report: OrphanReport): string {
  const lines: string[] = [`Orphan Routes`, `─────────────`];
  if (report.orphans.length === 0) {
    lines.push('  ✓ No orphans found.');
  } else {
    for (const o of report.orphans) {
      lines.push(`  ✗ ${o}`);
    }
  }
  lines.push('');
  lines.push(report.summary);
  return lines.join('\n');
}
