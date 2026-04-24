import * as path from 'path';
import * as fs from 'fs';
import { buildTimeline, formatTimeline, timelineStats } from './route-timeline';

export interface TimelineFlags {
  historyFile: string;
  stats: boolean;
  branch?: string;
  help: boolean;
}

export const timelineHelpText = `
Usage: routewatch timeline [options]

Options:
  --history <file>   Path to history JSON file (default: .routewatch-history.json)
  --stats            Show aggregate statistics instead of full timeline
  --branch <name>    Filter entries to a specific branch
  --help             Show this help message
`.trim();

export function parseTimelineFlags(argv: string[]): TimelineFlags {
  const flags: TimelineFlags = {
    historyFile: '.routewatch-history.json',
    stats: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--stats') flags.stats = true;
    else if (arg === '--history' && argv[i + 1]) flags.historyFile = argv[++i];
    else if (arg === '--branch' && argv[i + 1]) flags.branch = argv[++i];
  }

  return flags;
}

export function runTimelineCli(argv: string[]): void {
  const flags = parseTimelineFlags(argv);

  if (flags.help) {
    console.log(timelineHelpText);
    return;
  }

  const resolved = path.resolve(flags.historyFile);
  if (!fs.existsSync(resolved)) {
    console.error(`History file not found: ${resolved}`);
    process.exit(1);
  }

  let timeline = buildTimeline(resolved);

  if (flags.branch) {
    timeline = {
      ...timeline,
      entries: timeline.entries.filter(e => e.branch === flags.branch),
    };
  }

  if (flags.stats) {
    const stats = timelineStats(timeline);
    console.log('Timeline Statistics');
    console.log('-------------------');
    for (const [key, val] of Object.entries(stats)) {
      console.log(`  ${key}: ${val}`);
    }
  } else {
    console.log(formatTimeline(timeline));
  }
}
