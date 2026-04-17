import { RouteNode } from './tree';

const BRANCH = '├── ';
const LAST   = '└── ';
const PIPE   = '│   ';
const SPACE  = '    ';

function nodeLabel(node: RouteNode): string {
  const tags: string[] = [];
  if (node.isPage)    tags.push('page');
  if (node.isLayout)  tags.push('layout');
  if (node.isLoading) tags.push('loading');
  if (node.isError)   tags.push('error');
  const suffix = tags.length ? ` [${tags.join(', ')}]` : '';
  const prefix = node.isDynamic ? '\x1b[33m' : '';
  const reset  = node.isDynamic ? '\x1b[0m'  : '';
  return `${prefix}${node.name}${reset}${suffix}`;
}

function printLines(
  nodes: RouteNode[],
  indent = '',
  lines: string[] = []
): string[] {
  nodes.forEach((node, i) => {
    const isLast   = i === nodes.length - 1;
    const connector = isLast ? LAST : BRANCH;
    lines.push(indent + connector + nodeLabel(node));
    const childIndent = indent + (isLast ? SPACE : PIPE);
    printLines(node.children, childIndent, lines);
  });
  return lines;
}

export function printTree(nodes: RouteNode[], rootLabel = 'app'): string {
  const lines = [rootLabel, ...printLines(nodes)];
  return lines.join('\n');
}

export function printTreeToConsole(nodes: RouteNode[], rootLabel = 'app'): void {
  console.log(printTree(nodes, rootLabel));
}
