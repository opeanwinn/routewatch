import { RouteNode } from "./tree";

export interface MergeResult {
  merged: RouteNode;
  conflicts: string[];
  added: string[];
  removed: string[];
}

/**
 * Deep-merge two RouteNode trees. Nodes present in both are kept;
 * nodes only in `next` are marked added; nodes only in `base` are kept
 * but tracked as removed.
 */
export function mergeTrees(
  base: RouteNode,
  next: RouteNode
): MergeResult {
  const conflicts: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  function mergeNode(b: RouteNode, n: RouteNode): RouteNode {
    const result: RouteNode = {
      ...b,
      type: n.type !== b.type ? n.type : b.type,
      children: [],
    };

    if (n.type !== b.type) {
      conflicts.push(b.path);
    }

    const baseMap = new Map<string, RouteNode>(
      (b.children ?? []).map((c) => [c.segment, c])
    );
    const nextMap = new Map<string, RouteNode>(
      (n.children ?? []).map((c) => [c.segment, c])
    );

    for (const [seg, nextChild] of nextMap) {
      if (baseMap.has(seg)) {
        result.children!.push(mergeNode(baseMap.get(seg)!, nextChild));
      } else {
        added.push(nextChild.path);
        result.children!.push({ ...nextChild });
      }
    }

    for (const [seg, baseChild] of baseMap) {
      if (!nextMap.has(seg)) {
        removed.push(baseChild.path);
        result.children!.push({ ...baseChild });
      }
    }

    return result;
  }

  const merged = mergeNode(base, next);
  return { merged, conflicts, added, removed };
}

export function formatMergeResult(result: MergeResult): string {
  const lines: string[] = [];
  if (result.added.length)
    lines.push(`Added (${result.added.length}):\n` + result.added.map((p) => `  + ${p}`).join("\n"));
  if (result.removed.length)
    lines.push(`Removed (${result.removed.length}):\n` + result.removed.map((p) => `  - ${p}`).join("\n"));
  if (result.conflicts.length)
    lines.push(`Conflicts (${result.conflicts.length}):\n` + result.conflicts.map((p) => `  ! ${p}`).join("\n"));
  if (!lines.length) lines.push("No differences found.");
  return lines.join("\n");
}
