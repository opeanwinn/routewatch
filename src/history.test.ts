import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  emptyHistory,
  addHistoryEntry,
  countNodes,
  saveHistory,
  loadHistory,
  formatHistory,
  pruneHistory,
} from './history';
import { RouteNode } from './snapshot';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, type: 'page', children };
}

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'history-test-'));
}

describe('countNodes', () => {
  it('counts single node', () => {
    expect(countNodes(makeNode('a'))).toBe(1);
  });

  it('counts nested nodes', () => {
    const tree = makeNode('root', [makeNode('a', [makeNode('b')]), makeNode('c')]);
    expect(countNodes(tree)).toBe(4);
  });
});

describe('addHistoryEntry', () => {
  it('appends an entry', () => {
    const store = emptyHistory();
    const updated = addHistoryEntry(store, 'main', makeNode('root'));
    expect(updated.entries).toHaveLength(1);
    expect(updated.entries[0].branch).toBe('main');
    expect(updated.entries[0].routeCount).toBe(1);
  });
});

describe('saveHistory / loadHistory', () => {
  it('round-trips to disk', () => {
    const dir = createTmpDir();
    const file = path.join(dir, 'history.json');
    let store = emptyHistory();
    store = addHistoryEntry(store, 'main', makeNode('root', [makeNode('about')]));
    saveHistory(store, file);
    const loaded = loadHistory(file);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.entries[0].routeCount).toBe(2);
  });

  it('returns empty store if file missing', () => {
    const store = loadHistory('/nonexistent/path/history.json');
    expect(store.entries).toHaveLength(0);
  });
});

describe('formatHistory', () => {
  it('shows no entries message', () => {
    expect(formatHistory(emptyHistory())).toBe('No history entries.');
  });

  it('lists entries', () => {
    let store = emptyHistory();
    store = addHistoryEntry(store, 'feat/x', makeNode('root'));
    const out = formatHistory(store);
    expect(out).toContain('feat/x');
    expect(out).toContain('[1]');
  });
});

describe('pruneHistory', () => {
  it('keeps only last N entries', () => {
    let store = emptyHistory();
    for (let i = 0; i < 5; i++) store = addHistoryEntry(store, `branch-${i}`, makeNode('r'));
    const pruned = pruneHistory(store, 3);
    expect(pruned.entries).toHaveLength(3);
    expect(pruned.entries[0].branch).toBe('branch-2');
  });
});
