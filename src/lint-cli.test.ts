import { parseLintFlags, runLintCli, lintHelpText } from './lint-cli';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = [], isPage = false): RouteNode {
  return { name, children, isPage };
}

describe('parseLintFlags', () => {
  it('parses --json flag', () => {
    const flags = parseLintFlags(['--json']);
    expect(flags.json).toBe(true);
  });

  it('parses --severity flag', () => {
    const flags = parseLintFlags(['--severity', 'error']);
    expect(flags.severity).toBe('error');
  });

  it('parses --help flag', () => {
    const flags = parseLintFlags(['--help']);
    expect(flags.help).toBe(true);
  });

  it('returns empty flags for no args', () => {
    const flags = parseLintFlags([]);
    expect(flags).toEqual({});
  });
});

describe('runLintCli', () => {
  const cleanRoot = makeNode('app', [makeNode('home', [makeNode('page', [], true)])]);
  const dirtyRoot = makeNode('app', [makeNode('MyRoute', []), makeNode('bad route', [])]);

  it('returns help text with --help', () => {
    expect(runLintCli(cleanRoot, ['--help'])).toBe(lintHelpText);
  });

  it('returns JSON output with --json', () => {
    const output = runLintCli(dirtyRoot, ['--json']);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('issues');
    expect(parsed).toHaveProperty('errorCount');
  });

  it('filters by severity with --severity error', () => {
    const output = runLintCli(dirtyRoot, ['--severity', 'error']);
    expect(output).toContain('no-spaces-in-segment');
    expect(output).not.toContain('no-uppercase-segment');
  });

  it('returns success message for clean tree', () => {
    const output = runLintCli(cleanRoot, []);
    expect(output).toContain('No lint issues found');
  });
});
