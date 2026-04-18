import { compareBranches } from './compare';
import { renderDiff, renderSummary } from './renderer';
import { formatOutput } from './formatter';
import { loadConfig } from './config';

export interface CompareFlags {
  base: string;
  head?: string;
  appDir: string;
  format: 'text' | 'json' | 'markdown';
  summary: boolean;
}

export function parseCompareFlags(argv: string[]): CompareFlags {
  const flags: CompareFlags = { base: '', appDir: 'app', format: 'text', summary: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base' || arg === '-b') flags.base = argv[++i] ?? '';
    else if (arg === '--head' || arg === '-h') flags.head = argv[++i];
    else if (arg === '--app-dir') flags.appDir = argv[++i] ?? 'app';
    else if (arg === '--format' || arg === '-f') flags.format = (argv[++i] ?? 'text') as CompareFlags['format'];
    else if (arg === '--summary' || arg === '-s') flags.summary = true;
  }
  return flags;
}

export async function runCompareCli(argv: string[], cwd = process.cwd()): Promise<void> {
  const flags = parseCompareFlags(argv);
  const config = await loadConfig(cwd).catch(() => ({}));
  const appDir = (config as any).appDir ?? flags.appDir;

  if (!flags.base) {
    console.error('Error: --base <branch> is required');
    process.exit(1);
  }

  const result = await compareBranches({ appDir, baseBranch: flags.base, headBranch: flags.head, cwd });

  if (flags.format !== 'text') {
    const output = formatOutput(result.diff, flags.format);
    console.log(output);
    return;
  }

  console.log(`Comparing ${result.baseBranch}..${result.headBranch}\n`);
  if (flags.summary) {
    console.log(renderSummary(result.diff));
  } else {
    console.log(renderDiff(result.diff));
  }
}
