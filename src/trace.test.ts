import { traceRoute, formatTrace } from './trace';
import { parseTraceFlags, runTraceCli } from './trace-cli';
import type { RouteNode } from './tree';

function makeNode(
  segment: string,
  type: RouteNode['type'] = 'layout',
  children: RouteNode[] = []
): RouteNode {
  return { segment, type, children };
}

const root = makeNode('/', 'layout', [
  makeNode('dashboard', 'layout', [
    makeNode('settings', 'page'),
    makeNode('[id]', 'page'),
  ]),
  makeNode('about', 'page'),
]);

describe('traceRoute', () => {
  it('returns found=true for a valid path', () => {
    const result = traceRoute(root, '/dashboard/settings');
    expect(result.found).toBe(true);
    expect(result.steps.length).toBe(3);
  });

  it('returns found=false for a missing path', () => {
    const result = traceRoute(root, '/missing/path');
    expect(result.found).toBe(false);
  });

  it('traces root path', () => {
    const result = traceRoute(root, '/');
    expect(result.found).toBe(true);
    expect(result.steps[0].segment).toBe('/');
  });

  it('matches dynamic segments', () => {
    const result = traceRoute(root, '/dashboard/42');
    expect(result.found).toBe(true);
  });
});

describe('formatTrace', () => {
  it('formats a found trace', () => {
    const result = traceRoute(root, '/about');
    const output = formatTrace(result);
    expect(output).toContain('about');
    expect(output).toContain('[page]');
  });

  it('shows not found message', () => {
    const result = traceRoute(root, '/nope');
    const output = formatTrace(result);
    expect(output).toContain('Route not found');
  });
});

describe('parseTraceFlags', () => {
  it('parses route argument', () => {
    const flags = parseTraceFlags(['/dashboard/settings']);
    expect(flags.route).toBe('/dashboard/settings');
  });

  it('parses --json flag', () => {
    const flags = parseTraceFlags(['/about', '--json']);
    expect(flags.json).toBe(true);
  });

  it('parses --help flag', () => {
    const flags = parseTraceFlags(['--help']);
    expect(flags.help).toBe(true);
  });
});

describe('runTraceCli', () => {
  it('returns help text when --help passed', () => {
    const out = runTraceCli(root, ['--help']);
    expect(out).toContain('Usage:');
  });

  it('returns error when no route given', () => {
    const out = runTraceCli(root, []);
    expect(out).toContain('Error:');
  });

  it('returns JSON when --json passed', () => {
    const out = runTraceCli(root, ['/about', '--json']);
    const parsed = JSON.parse(out);
    expect(parsed.route).toBe('/about');
  });

  it('returns formatted trace output', () => {
    const out = runTraceCli(root, ['/dashboard/settings']);
    expect(out).toContain('Trace for:');
  });
});
