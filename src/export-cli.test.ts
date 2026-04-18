import { parseExportFlags } from './export-cli';

describe('parseExportFlags', () => {
  it('returns defaults when no args given', () => {
    const flags = parseExportFlags([]);
    expect(flags.format).toBe('json');
    expect(flags.output).toBe('routewatch-output.json');
    expect(flags.appDir).toBe('app');
    expect(flags.pretty).toBe(false);
  });

  it('parses --format markdown', () => {
    const flags = parseExportFlags(['--format', 'markdown']);
    expect(flags.format).toBe('markdown');
  });

  it('parses -f text shorthand', () => {
    const flags = parseExportFlags(['-f', 'text']);
    expect(flags.format).toBe('text');
  });

  it('parses --output flag', () => {
    const flags = parseExportFlags(['--output', 'out/report.md']);
    expect(flags.output).toBe('out/report.md');
  });

  it('parses -o shorthand', () => {
    const flags = parseExportFlags(['-o', 'result.json']);
    expect(flags.output).toBe('result.json');
  });

  it('parses --app-dir flag', () => {
    const flags = parseExportFlags(['--app-dir', 'src/app']);
    expect(flags.appDir).toBe('src/app');
  });

  it('parses --pretty flag', () => {
    const flags = parseExportFlags(['--pretty']);
    expect(flags.pretty).toBe(true);
  });

  it('ignores unknown format value and keeps default', () => {
    const flags = parseExportFlags(['--format', 'xml']);
    expect(flags.format).toBe('json');
  });

  it('handles multiple flags together', () => {
    const flags = parseExportFlags(['--format', 'markdown', '--output', 'docs/routes.md', '--pretty']);
    expect(flags.format).toBe('markdown');
    expect(flags.output).toBe('docs/routes.md');
    expect(flags.pretty).toBe(true);
  });
});
