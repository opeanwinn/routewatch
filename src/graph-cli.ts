import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { buildGraph, formatGraph, graphToAdjacency } from './graph';

export interface GraphFlags {
  dir: string;
  format: 'text' | 'json' | 'adjacency';
  help: boolean;
}

export const graphHelpText = `
Usage: routewatch graph [options]

Options:
  --dir <path>        App router directory (default: app)
  --format <type>     Output format: text | json | adjacency (default: text)
  --help              Show this help message
`.trim();

export function parseGraphFlags(args: string[]): GraphFlags {
  const flags: GraphFlags = { dir: 'app', format: 'text', help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--dir' && args[i + 1]) {
      flags.dir = args[++i];
    } else if (arg === '--format' && args[i + 1]) {
      const fmt = args[++i];
      if (fmt === 'json' || fmt === 'adjacency' || fmt === 'text') {
        flags.format = fmt;
      }
    }
  }

  return flags;
}

export function runGraphCli(args: string[]): void {
  const flags = parseGraphFlags(args);

  if (flags.help) {
    console.log(graphHelpText);
    return;
  }

  const scanned = scanAppRouter(flags.dir);
  const tree = buildTree(scanned);
  const graph = buildGraph(tree);

  if (flags.format === 'json') {
    console.log(JSON.stringify(graph, null, 2));
  } else if (flags.format === 'adjacency') {
    const adj = graphToAdjacency(graph);
    console.log(JSON.stringify(adj, null, 2));
  } else {
    console.log(formatGraph(graph));
  }
}
