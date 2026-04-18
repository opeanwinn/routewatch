import { parseArgs } from './index';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { exportRoutes } from './export';
import { loadConfig } from './config';

export interface ExportCliFlags {
  format: 'json' | 'markdown' | 'text';
  output: string;
  appDir: string;
  pretty: boolean;
}

export function parseExportFlags(argv: string[]): ExportCliFlags {
  const flags: ExportCliFlags = {
    format: 'json',
    output: 'routewatch-output.json',
    appDir: 'app',
    pretty: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--format' || arg === '-f') && argv[i + 1]) {
      const val = argv[++i];
      if (val === 'json' || val === 'markdown' || val === 'text') {
        flags.format = val;
      }
    } else if ((arg === '--output' || arg === '-o') && argv[i + 1]) {
      flags.output = argv[++i];
    } else if (arg === '--app-dir' && argv[i + 1]) {
      flags.appDir = argv[++i];
    } else if (arg === '--pretty') {
      flags.pretty = true;
    }
  }
  return flags;
}

export async function runExportCli(argv: string[]): Promise<void> {
  const flags = parseExportFlags(argv);
  const config = loadConfig(null);
  const appDir = config?.appDir ?? flags.appDir;

  const scanned = scanAppRouter(appDir);
  const tree = buildTree(scanned);

  exportRoutes(tree, null, {
    format: flags.format,
    outputPath: flags.output,
    pretty: flags.pretty,
  });

  console.log(`Exported route tree to ${flags.output} (format: ${flags.format})`);
}
