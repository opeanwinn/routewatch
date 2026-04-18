import { RouteNode } from './tree';

export interface SearchResult {
  node: RouteNode;
  path: string;
  matchedOn: 'path' | 'segment';
}

export function searchRoutes(
  nodes: RouteNode[],
  query: string,
  basePath = ''
): SearchResult[] {
  const results: SearchResult[] = [];
  const q = query.toLowerCase();

  for (const node of nodes) {
    const fullPath = basePath ? `${basePath}/${node.segment}` : `/${node.segment}`;
    const segmentMatch = node.segment.toLowerCase().includes(q);
    const pathMatch = fullPath.toLowerCase().includes(q);

    if (segmentMatch || pathMatch) {
      results.push({
        node,
        path: fullPath,
        matchedOn: segmentMatch ? 'segment' : 'path',
      });
    }

    if (node.children && node.children.length > 0) {
      const childResults = searchRoutes(node.children, query, fullPath);
      results.push(...childResults);
    }
  }

  return results;
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return 'No routes matched.';
  const lines = results.map(r => `  ${r.path}  (matched: ${r.matchedOn})`);
  return `Found ${results.length} route(s):\n${lines.join('\n')}`;
}
