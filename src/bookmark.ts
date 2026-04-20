export interface Bookmark {
  path: string;
  label?: string;
  createdAt: string;
}

export interface BookmarkStore {
  bookmarks: Bookmark[];
}

export function emptyBookmarkStore(): BookmarkStore {
  return { bookmarks: [] };
}

export function addBookmark(store: BookmarkStore, path: string, label?: string): BookmarkStore {
  if (store.bookmarks.find(b => b.path === path)) {
    return store;
  }
  return {
    bookmarks: [
      ...store.bookmarks,
      { path, label, createdAt: new Date().toISOString() }
    ]
  };
}

export function removeBookmark(store: BookmarkStore, path: string): BookmarkStore {
  return { bookmarks: store.bookmarks.filter(b => b.path !== path) };
}

export function getBookmark(store: BookmarkStore, path: string): Bookmark | undefined {
  return store.bookmarks.find(b => b.path === path);
}

export function listBookmarks(store: BookmarkStore): Bookmark[] {
  return store.bookmarks;
}

export function formatBookmarks(store: BookmarkStore): string {
  if (store.bookmarks.length === 0) return 'No bookmarks.';
  return store.bookmarks
    .map(b => `${b.path}${b.label ? ` (${b.label})` : ''} — ${b.createdAt}`)
    .join('\n');
}
