import { groupBySegment, groupByType, formatGroup } from './group';
import { RouteNode } from './tree';

export interface GroupFlags {
  by: 'segment' | 'type';
  depth: number;
  help: boolean;
}

export const groupHelpText = `
Usage: routewatch group [options]

Options:
  --by <segment|type>   Grouping strategy (default: segment)
  --depth <n>           Segment depth for grouping (default: 1)
  --help                Show this help
`.trim();

export function parseGroupFlags(args: string[]): GroupFlags {
  const flags: GroupFlags = { by: 'segment', depth: 1, help: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help') flags.help = true;
    else if (args[i] === '--by' && args[i + 1]) {
      const val = args[++i];
      if (val === 'type' || val === 'segment') flags.by = val;
    } else if (args[i] === '--depth' && args[i + 1]) {
      const n = parseInt(args[++i], 10);
      if (!isNaN(n) && n > 0) flags.depth = n;
    }
  }
  return flags;
}

export function runGroupCli(nodes: RouteNode[], args: string[]): string {
  const flags = parseGroupFlags(args);
  if (flags.help) return groupHelpText;
  const map = flags.by === 'type'
    ? groupByType(nodes)
    : groupBySegment(nodes, flags.depth);
  return formatGroup(map);
}
