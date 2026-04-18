import { parseAliasFlags, handleAliasFlags } from './alias-cli';

describe('parseAliasFlags', () => {
  it('parses --alias flag', () => {
    const flags = parseAliasFlags(['--alias', '/old=/new']);
    expect(flags.aliases).toEqual({ '/old': '/new' });
  });

  it('parses --alias= inline form', () => {
    const flags = parseAliasFlags(['--alias=/a=/b']);
    expect(flags.aliases).toEqual({ '/a': '/b' });
  });

  it('parses multiple aliases', () => {
    const flags = parseAliasFlags(['--alias', '/a=/b', '--alias', '/c=/d']);
    expect(flags.aliases).toEqual({ '/a': '/b', '/c': '/d' });
  });

  it('detects --list-aliases', () => {
    const flags = parseAliasFlags(['--list-aliases']);
    expect(flags.list).toBe(true);
  });

  it('defaults list to false', () => {
    const flags = parseAliasFlags([]);
    expect(flags.list).toBe(false);
  });
});

describe('handleAliasFlags', () => {
  it('returns false when list is false', () => {
    const result = handleAliasFlags({ aliases: {}, list: false });
    expect(result).toBe(false);
  });

  it('returns true and prints when list is true', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = handleAliasFlags({ aliases: { '/a': '/b' }, list: true });
    expect(result).toBe(true);
    expect(spy).toHaveBeenCalledWith('/a -> /b');
    spy.mockRestore();
  });
});
