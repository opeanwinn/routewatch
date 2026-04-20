import { emptyBookmarkStore, addBookmark, removeBookmark, getBookmark, listBookmarks, formatBookmarks } from './bookmark';
import { parseBookmarkFlags, runBookmarkCli } from './bookmark-cli';

describe('bookmark store', () => {
  it('starts empty', () => {
    const store = emptyBookmarkStore();
    expect(store.bookmarks).toHaveLength(0);
  });

  it('adds a bookmark', () => {
    const store = addBookmark(emptyBookmarkStore(), '/dashboard');
    expect(store.bookmarks).toHaveLength(1);
    expect(store.bookmarks[0].path).toBe('/dashboard');
  });

  it('does not duplicate bookmarks', () => {
    let store = addBookmark(emptyBookmarkStore(), '/dashboard');
    store = addBookmark(store, '/dashboard');
    expect(store.bookmarks).toHaveLength(1);
  });

  it('adds label to bookmark', () => {
    const store = addBookmark(emptyBookmarkStore(), '/settings', 'Settings Page');
    expect(store.bookmarks[0].label).toBe('Settings Page');
  });

  it('removes a bookmark', () => {
    let store = addBookmark(emptyBookmarkStore(), '/dashboard');
    store = removeBookmark(store, '/dashboard');
    expect(store.bookmarks).toHaveLength(0);
  });

  it('gets a bookmark by path', () => {
    const store = addBookmark(emptyBookmarkStore(), '/profile');
    expect(getBookmark(store, '/profile')).toBeDefined();
    expect(getBookmark(store, '/missing')).toBeUndefined();
  });

  it('lists bookmarks', () => {
    let store = addBookmark(emptyBookmarkStore(), '/a');
    store = addBookmark(store, '/b');
    expect(listBookmarks(store)).toHaveLength(2);
  });

  it('formats empty store', () => {
    expect(formatBookmarks(emptyBookmarkStore())).toBe('No bookmarks.');
  });

  it('formats bookmarks with label', () => {
    const store = addBookmark(emptyBookmarkStore(), '/home', 'Home');
    expect(formatBookmarks(store)).toContain('/home');
    expect(formatBookmarks(store)).toContain('Home');
  });
});

describe('bookmark cli', () => {
  it('parses --add flag', () => {
    const flags = parseBookmarkFlags(['--add', '/dashboard']);
    expect(flags.add).toBe('/dashboard');
  });

  it('parses --remove flag', () => {
    const flags = parseBookmarkFlags(['--remove', '/dashboard']);
    expect(flags.remove).toBe('/dashboard');
  });

  it('parses --list flag', () => {
    expect(parseBookmarkFlags(['--list']).list).toBe(true);
  });

  it('adds via cli', () => {
    const { output } = runBookmarkCli({ add: '/test', list: false }, emptyBookmarkStore());
    expect(output).toContain('/test');
  });

  it('lists via cli', () => {
    const store = addBookmark(emptyBookmarkStore(), '/x');
    const { output } = runBookmarkCli({ list: true }, store);
    expect(output).toContain('/x');
  });
});
