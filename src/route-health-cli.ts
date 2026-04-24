import { buildHealthReport, formatHealthReport } from './route-health';
import { scanAppRouter } from './scanner';
import { flattenTree } from './tree';

export interface HealthFlags {
  dir: string;
  format: 'text' | 'json';
  minScore: number;
  status?: 'healthy' | 'warning' | 'critical';
}

export function parseHealthFlags(args: string[]): HealthFlags {
  const flags: HealthFlags = { dir: 'app', format: 'text', minScore: 0 };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--dir' || arg === '-d') && args[i + 1]) {
      flags.dir = args[++i];
    } else if (arg === '--json') {
      flags.format = 'json';
    } else if (arg === '--min-score' && args[i + 1]) {
      flags.minScore = parseInt(args[++i], 10);
    } else if (arg === '--status' && args[i + 1]) {
      flags.status = args[++i] as HealthFlags['status'];
    }
  }
  return flags;
}

export async function runHealthCli(args: string[]): Promise<void> {
  const flags = parseHealthFlags(args);

  if (args.includes('--help') || args.includes('-h')) {
    console.log([
      'Usage: routewatch health [options]',
      '',
      'Options:',
      '  --dir, -d <path>     App router directory (default: app)',
      '  --json               Output as JSON',
      '  --min-score <n>      Only show routes with score below n',
      '  --status <s>         Filter by status: healthy | warning | critical',
      '  --help, -h           Show help',
    ].join('\n'));
    return;
  }

  const tree = await scanAppRouter(flags.dir);
  const flat = flattenTree(tree);
  let nodes = flat.map(node => ({ path: node.path, node }));

  if (flags.minScore > 0) {
    nodes = nodes.filter(({ path, node }) => {
      const { score } = require('./route-health').assessHealth(path, node);
      return score < flags.minScore;
    });
  }

  const report = buildHealthReport(nodes);

  if (flags.status) {
    report.entries = report.entries.filter(e => e.status === flags.status);
  }

  if (flags.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatHealthReport(report));
  }
}
