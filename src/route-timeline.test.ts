import { buildTimeline, formatTimeline, timelineStats, RouteTimeline } from './route-timeline';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rw-timeline-'));
}

function writeHistory(dir: string, entries: object[]): string {
  const file = path.join(dir, 'history.json');
  fs.writeFileSync(file, JSON.stringify({ entries }));
  return file;
}

describe('buildTimeline', () => {
  it('returns empty timeline for no entries', () => {
    const dir = createTmpDir();
    const file = writeHistory(dir, []);
    const tl = buildTimeline(file);
    expect(tl.entries).toHaveLength(0);
    expect(tl.earliest).toBe(0);
    expect(tl.latest).toBe(0);
  });

  it('marks all paths as added for first entry', () => {
    const dir = createTmpDir();
    const file = writeHistory(dir, [
      { timestamp: 1000, branch: 'main', paths: ['/a', '/b'] },
    ]);
    const tl = buildTimeline(file);
    expect(tl.entries[0].added).toEqual(['/a', '/b']);
    expect(tl.entries[0].removed).toEqual([]);
  });

  it('detects added and removed routes between snapshots', () => {
    const dir = createTmpDir();
    const file = writeHistory(dir, [
      { timestamp: 1000, branch: 'main', paths: ['/a', '/b'] },
      { timestamp: 2000, branch: 'main', paths: ['/b', '/c'] },
    ]);
    const tl = buildTimeline(file);
    expect(tl.entries[1].added).toEqual(['/c']);
    expect(tl.entries[1].removed).toEqual(['/a']);
  });

  it('sets earliest and latest timestamps', () => {
    const dir = createTmpDir();
    const file = writeHistory(dir, [
      { timestamp: 500, branch: 'main', paths: [] },
      { timestamp: 1500, branch: 'dev', paths: [] },
    ]);
    const tl = buildTimeline(file);
    expect(tl.earliest).toBe(500);
    expect(tl.latest).toBe(1500);
  });
});

describe('formatTimeline', () => {
  it('returns message for empty timeline', () => {
    const tl: RouteTimeline = { entries: [], earliest: 0, latest: 0 };
    expect(formatTimeline(tl)).toContain('No history');
  });

  it('includes branch and route changes', () => {
    const tl: RouteTimeline = {
      entries: [{ timestamp: 1000, branch: 'main', added: ['/home'], removed: [], total: 1 }],
      earliest: 1000,
      latest: 1000,
    };
    const out = formatTimeline(tl);
    expect(out).toContain('main');
    expect(out).toContain('+ /home');
  });
});

describe('timelineStats', () => {
  it('computes aggregate stats', () => {
    const tl: RouteTimeline = {
      entries: [
        { timestamp: 1000, branch: 'main', added: ['/a', '/b'], removed: [], total: 2 },
        { timestamp: 2000, branch: 'main', added: ['/c'], removed: ['/a'], total: 2 },
      ],
      earliest: 1000,
      latest: 2000,
    };
    const stats = timelineStats(tl);
    expect(stats.snapshots).toBe(2);
    expect(stats.totalAdded).toBe(3);
    expect(stats.totalRemoved).toBe(1);
    expect(stats.netChange).toBe(2);
  });
});
