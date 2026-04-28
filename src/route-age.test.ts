import { buildAgeReport, formatAgeReport, RouteAgeReport } from './route-age';
import { RouteNode } from './tree';
import { HistoryEntry } from './history';

function makeNode(p: string, children: RouteNode[] = []): RouteNode {
  return { path: p, name: p.split('/').pop() ?? p, type: 'page', children };
}

function makeEntry(timestamp: string, routes: string[]): HistoryEntry {
  return { timestamp, routes, added: [], removed: [] } as unknown as HistoryEntry;
}

describe('buildAgeReport', () => {
  const root = makeNode('/', [
    makeNode('/about'),
    makeNode('/blog', [makeNode('/blog/[slug]')]),
  ]);

  const now = new Date();
  const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  const history: HistoryEntry[] = [
    makeEntry(old.toISOString(), ['/', '/about', '/blog', '/blog/[slug]']),
    makeEntry(now.toISOString(), ['/', '/blog', '/blog/[slug]']),
  ];

  it('returns an entry for every route', () => {
    const report = buildAgeReport(root, history);
    expect(report.entries.length).toBe(4);
  });

  it('counts change occurrences correctly', () => {
    const report = buildAgeReport(root, history);
    const root_ = report.entries.find((e) => e.path === '/');
    expect(root_?.changeCount).toBe(2);
    const about = report.entries.find((e) => e.path === '/about');
    expect(about?.changeCount).toBe(1);
  });

  it('calculates ageDays from first appearance', () => {
    const report = buildAgeReport(root, history);
    const blog = report.entries.find((e) => e.path === '/blog');
    expect(blog?.ageDays).toBeGreaterThanOrEqual(9);
  });

  it('identifies oldest and newest', () => {
    const report = buildAgeReport(root, history);
    expect(report.oldest).not.toBeNull();
    expect(report.newest).not.toBeNull();
    expect(report.oldest!.ageDays).toBeGreaterThanOrEqual(
      report.newest!.ageDays
    );
  });

  it('computes averageAgeDays', () => {
    const report = buildAgeReport(root, history);
    expect(report.averageAgeDays).toBeGreaterThanOrEqual(0);
  });

  it('handles empty history gracefully', () => {
    const report = buildAgeReport(root, []);
    expect(report.entries.every((e) => e.changeCount === 0)).toBe(true);
  });
});

describe('formatAgeReport', () => {
  it('includes header and summary lines', () => {
    const report: RouteAgeReport = {
      entries: [
        { path: '/foo', firstSeen: '2024-01-01', lastSeen: '2024-06-01', ageDays: 150, changeCount: 3 },
      ],
      oldest: { path: '/foo', firstSeen: '2024-01-01', lastSeen: '2024-06-01', ageDays: 150, changeCount: 3 },
      newest: { path: '/foo', firstSeen: '2024-01-01', lastSeen: '2024-06-01', ageDays: 150, changeCount: 3 },
      averageAgeDays: 150,
    };
    const out = formatAgeReport(report);
    expect(out).toContain('Route Age Report');
    expect(out).toContain('/foo');
    expect(out).toContain('150');
    expect(out).toContain('Average');
  });
});
