import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { scanAppRouter, RouteNode } from './scanner';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-'));
}

function mkdir(base: string, ...parts: string[]): string {
  const full = path.join(base, ...parts);
  fs.mkdirSync(full, { recursive: true });
  return full;
}

function touch(base: string, ...parts: string[]): void {
  fs.writeFileSync(path.join(base, ...parts), '');
}

describe('scanAppRouter', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects a root page', () => {
    touch(tmpDir, 'page.tsx');
    const tree = scanAppRouter(tmpDir);
    expect(tree.hasPage).toBe(true);
    expect(tree.segment).toBe('/');
  });

  it('detects dynamic segments', () => {
    mkdir(tmpDir, '[id]');
    touch(tmpDir, '[id]', 'page.tsx');
    const tree = scanAppRouter(tmpDir);
    const child = tree.children.find(c => c.segment === '[id]');
    expect(child).toBeDefined();
    expect(child?.isDynamic).toBe(true);
    expect(child?.hasPage).toBe(true);
  });

  it('detects catch-all segments', () => {
    mkdir(tmpDir, '[...slug]');
    const tree = scanAppRouter(tmpDir);
    const child = tree.children.find(c => c.segment === '[...slug]');
    expect(child?.isCatchAll).toBe(true);
  });

  it('detects route groups', () => {
    mkdir(tmpDir, '(marketing)');
    const tree = scanAppRouter(tmpDir);
    const child = tree.children.find(c => c.segment === '(marketing)');
    expect(child?.isGroup).toBe(true);
  });

  it('detects layouts', () => {
    touch(tmpDir, 'layout.tsx');
    const tree = scanAppRouter(tmpDir);
    expect(tree.hasLayout).toBe(true);
  });
});
