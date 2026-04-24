import { describe, it, expect } from 'vitest';
import { parseSimilarityFlags, similarityHelpText } from './route-similarity-cli';

describe('parseSimilarityFlags', () => {
  it('returns defaults with no args', () => {
    const flags = parseSimilarityFlags([]);
    expect(flags.dir).toBe('.');
    expect(flags.threshold).toBe(0.6);
    expect(flags.json).toBe(false);
    expect(flags.help).toBe(false);
  });

  it('parses --dir', () => {
    const flags = parseSimilarityFlags(['--dir', '/my/app']);
    expect(flags.dir).toBe('/my/app');
  });

  it('parses -d shorthand', () => {
    const flags = parseSimilarityFlags(['-d', './src']);
    expect(flags.dir).toBe('./src');
  });

  it('parses --threshold', () => {
    const flags = parseSimilarityFlags(['--threshold', '0.75']);
    expect(flags.threshold).toBeCloseTo(0.75);
  });

  it('parses -t shorthand', () => {
    const flags = parseSimilarityFlags(['-t', '0.8']);
    expect(flags.threshold).toBeCloseTo(0.8);
  });

  it('parses --json', () => {
    const flags = parseSimilarityFlags(['--json']);
    expect(flags.json).toBe(true);
  });

  it('parses --help', () => {
    const flags = parseSimilarityFlags(['--help']);
    expect(flags.help).toBe(true);
  });

  it('parses -h shorthand', () => {
    const flags = parseSimilarityFlags(['-h']);
    expect(flags.help).toBe(true);
  });

  it('handles multiple flags together', () => {
    const flags = parseSimilarityFlags(['--json', '-t', '0.5', '-d', './app']);
    expect(flags.json).toBe(true);
    expect(flags.threshold).toBeCloseTo(0.5);
    expect(flags.dir).toBe('./app');
  });
});

describe('similarityHelpText', () => {
  it('mentions threshold option', () => {
    expect(similarityHelpText).toMatch('--threshold');
  });

  it('mentions json option', () => {
    expect(similarityHelpText).toMatch('--json');
  });
});
