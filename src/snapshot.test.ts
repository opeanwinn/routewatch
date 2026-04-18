import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createSnapshot, saveSnapshot, loadSnapshot, snapshotFileName } from './snapshot';
import { RouteNode } from './tree';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-test-'));
}

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, path: '/' + name, isPage: children.length === 0, children };
}

describe('snapshotFileName', () => {
  it('replaces unsafe chars with underscores', () => {
    expect(snapshotFileName('feat/my-branch')).toBe('routewatch-snapshot-feat_my-branch.json');
  });

  it('handles simple branch names', () => {
    expect(snapshotFileName('main')).toBe('routewatch-snapshot-main.json');
  });
});

describe('createSnapshot', () => {
  it('creates a snapshot with correct fields', () => {
    const root = makeNode('root');
    const snap = createSnapshot('main', 'app', root);
    expect(snap.branch).toBe('main');
    expect(snap.appDir).toBe('app');
    expect(snap.routes).toBe(root);
    expect(typeof snap.timestamp).toBe('string');
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot to disk', () => {
    const tmp = createTmpDir();
    const root = makeNode('root', [makeNode('about')]);
    const snap = createSnapshot('dev', 'app', root);
    const file = path.join(tmp, 'snap.json');
    saveSnapshot(snap, file);
    const loaded = loadSnapshot(file);
    expect(loaded.branch).toBe('dev');
    expect(loaded.routes.name).toBe('root');
  });

  it('throws if file does not exist', () => {
    expect(() => loadSnapshot('/nonexistent/path.json')).toThrow('not found');
  });

  it('throws on invalid snapshot format', () => {
    const tmp = createTmpDir();
    const file = path.join(tmp, 'bad.json');
    fs.writeFileSync(file, JSON.stringify({ foo: 'bar' }));
    expect(() => loadSnapshot(file)).toThrow('Invalid snapshot format');
  });

  it('creates output directory if missing', () => {
    const tmp = createTmpDir();
    const nested = path.join(tmp, 'deep', 'dir', 'snap.json');
    const snap = createSnapshot('main', 'app', makeNode('root'));
    saveSnapshot(snap, nested);
    expect(fs.existsSync(nested)).toBe(true);
  });
});
