import * as fs from 'fs';
import * as path from 'path';

export interface RouteWatchConfig {
  appDir: string;
  defaultFormat: 'tree' | 'json' | 'markdown';
  ignore: string[];
  diffOnly: boolean;
}

const DEFAULTS: RouteWatchConfig = {
  appDir: 'app',
  defaultFormat: 'tree',
  ignore: [],
  diffOnly: false,
};

const CONFIG_FILENAMES = [
  'routewatch.config.json',
  '.routewatchrc',
  '.routewatchrc.json',
];

export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const name of CONFIG_FILENAMES) {
    const full = path.join(cwd, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

export function loadConfig(cwd: string = process.cwd()): RouteWatchConfig {
  const configPath = findConfigFile(cwd);
  if (!configPath) return { ...DEFAULTS };

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<RouteWatchConfig>;
    return { ...DEFAULTS, ...parsed };
  } catch (err) {
    console.warn(`[routewatch] Failed to parse config at ${configPath}. Using defaults.`);
    return { ...DEFAULTS };
  }
}

export function validateConfig(config: RouteWatchConfig): string[] {
  const errors: string[] = [];
  const validFormats = ['tree', 'json', 'markdown'];
  if (!validFormats.includes(config.defaultFormat)) {
    errors.push(`Invalid defaultFormat "${config.defaultFormat}". Must be one of: ${validFormats.join(', ')}.`);
  }
  if (!config.appDir || typeof config.appDir !== 'string') {
    errors.push('appDir must be a non-empty string.');
  }
  if (!Array.isArray(config.ignore)) {
    errors.push('ignore must be an array of strings.');
  }
  return errors;
}
