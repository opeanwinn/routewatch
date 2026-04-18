import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exportRoutes, exportToString, resolveOutputPath, ensureDir } from './export';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, path: '/' + name, isPage: children.length === 0, children };
}

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-export-'));
}

describe('resolveOutputPath', () => {
  it('returns absolute path unchanged', () => {
    expect(resolveOutputPath('/tmp/out.json')).toBe('/tmp/out.json');
  });

  it('resolves relative path against cwd', () => {
    const result = resolveOutputPath('out/report.md');
    expect(result).toBe(path.resolve(process.cwd(), 'out/report.md'));
  });
});

describe('ensureDir', () => {
  it('creates missing directories', () => {
    const tmp = createTmpDir();
    const filePath = path.join(tmp, 'a', 'b', 'file.txt');
    ensureDir(filePath);
    expect(fs.existsSync(path.join(tmp, 'a', 'b'))).toBe(true);
    fs.rmSync(tmp, { recursive: true });
  });
});

describe('exportRoutes', () => {
  it('writes file with json format', () => {
    const tmp = createTmpDir();
    const outPath = path.join(tmp, 'routes.json');
    const tree = makeNode('root', [makeNode('about')]);
    exportRoutes(tree, null, { format: 'json', outputPath: outPath, pretty: true });
    expect(fs.existsSync(outPath)).toBe(true);
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
    fs.rmSync(tmp, { recursive: true });
  });
});

describe('exportToString', () => {
  it('returns non-empty string for json format', () => {
    const tree = makeNode('root', [makeNode('blog')]);
    const result = exportToString(tree, null, 'json', true);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
