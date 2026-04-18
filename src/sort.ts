export type SortKey = 'name' | 'depth' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  key: SortKey;
  order: SortOrder;
}

export interface RouteNode {
  name: string;
  path: string;
  children?: RouteNode[];
  isPage?: boolean;
  isLayout?: boolean;
}

export function sortNodes(nodes: RouteNode[], opts: SortOptions): RouteNode[] {
  const sorted = [...nodes].sort((a, b) => {
    let cmp = 0;
    if (opts.key === 'name') {
      cmp = a.name.localeCompare(b.name);
    } else if (opts.key === 'depth') {
      const da = a.path.split('/').length;
      const db = b.path.split('/').length;
      cmp = da - db;
    } else if (opts.key === 'type') {
      const typeRank = (n: RouteNode) =>
        n.isLayout ? 0 : n.isPage ? 1 : 2;
      cmp = typeRank(a) - typeRank(b);
    }
    return opts.order === 'desc' ? -cmp : cmp;
  });

  return sorted.map(node => ({
    ...node,
    children: node.children ? sortNodes(node.children, opts) : undefined,
  }));
}

export function parseSortOptions(args: string[]): SortOptions {
  const keyFlag = args.find(a => a.startsWith('--sort-by='));
  const orderFlag = args.find(a => a.startsWith('--sort-order='));
  const key = (keyFlag?.split('=')[1] ?? 'name') as SortKey;
  const order = (orderFlag?.split('=')[1] ?? 'asc') as SortOrder;
  const validKeys: SortKey[] = ['name', 'depth', 'type'];
  const validOrders: SortOrder[] = ['asc', 'desc'];
  return {
    key: validKeys.includes(key) ? key : 'name',
    order: validOrders.includes(order) ? order : 'asc',
  };
}
