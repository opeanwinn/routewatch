import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { findConfigFile, loadConfig, validateConfig, RouteWatchConfig } from './config';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-config-'));
}

describe('findConfigFile', () => {
  it('returns null when no config file exists', () => {
    const dir = createTmpDir();
    expect(findConfigFile(dir)).toBeNull();
  });

  it('finds routewatch.config.json', () => {
    const dir = createTmpDir();
    const filePath = path.join(dir, 'routewatch.config.json');
    fs.writeFileSync(filePath, '{}');
    expect(findConfigFile(dir)).toBe(filePath);
  });

  it('finds .routewatchrc', () => {
    const dir = createTmpDir();
    const filePath = path.join(dir, '.routewatchrc');
    fs.writeFileSync(filePath, '{}');
    expect(findConfigFile(dir)).toBe(filePath);
  });
});

describe('loadConfig', () => {
  it('returns defaults when no config file found', () => {
    const dir = createTmpDir();
    const config = loadConfig(dir);
    expect(config.appDir).toBe('app');
    expect(config.defaultFormat).toBe('tree');
    expect(config.ignore).toEqual([]);
    expect(config.diffOnly).toBe(false);
  });

  it('merges user config with defaults', () => {
    const dir = createTmpDir();
    fs.writeFileSync(
      path.join(dir, 'routewatch.config.json'),
      JSON.stringify({ appDir: 'src/app', defaultFormat: 'json' })
    );
    const config = loadConfig(dir);
    expect(config.appDir).toBe('src/app');
    expect(config.defaultFormat).toBe('json');
    expect(config.ignore).toEqual([]);
  });

  it('returns defaults on malformed JSON', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'routewatch.config.json'), 'not json');
    const config = loadConfig(dir);
    expect(config.appDir).toBe('app');
  });
});

describe('validateConfig', () => {
  const base: RouteWatchConfig = { appDir: 'app', defaultFormat: 'tree', ignore: [], diffOnly: false };

  it('returns no errors for valid config', () => {
    expect(validateConfig(base)).toHaveLength(0);
  });

  it('errors on invalid defaultFormat', () => {
    const errors = validateConfig({ ...base, defaultFormat: 'xml' as any });
    expect(errors.some(e => e.includes('defaultFormat'))).toBe(true);
  });

  it('errors on invalid ignore type', () => {
    const errors = validateConfig({ ...base, ignore: 'bad' as any });
    expect(errors.some(e => e.includes('ignore'))).toBe(true);
  });
});
