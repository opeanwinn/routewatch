import { BookmarkStore, addBookmark, removeBookmark, listBookmarks, formatBookmarks } from './bookmark';

export interface BookmarkFlags {
  add?: string;
  remove?: string;
  label?: string;
  list: boolean;
}

export function parseBookmarkFlags(args: string[]): BookmarkFlags {
  const flags: BookmarkFlags = { list: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--add' && args[i + 1]) flags.add = args[++i];
    else if (args[i] === '--remove' && args[i + 1]) flags.remove = args[++i];
    else if (args[i] === '--label' && args[i + 1]) flags.label = args[++i];
    else if (args[i] === '--list') flags.list = true;
  }
  return flags;
}

export function runBookmarkCli(flags: BookmarkFlags, store: BookmarkStore): { store: BookmarkStore; output: string } {
  if (flags.add) {
    const updated = addBookmark(store, flags.add, flags.label);
    return { store: updated, output: `Bookmarked: ${flags.add}` };
  }
  if (flags.remove) {
    const updated = removeBookmark(store, flags.remove);
    return { store: updated, output: `Removed bookmark: ${flags.remove}` };
  }
  if (flags.list) {
    return { store, output: formatBookmarks(store) };
  }
  return { store, output: 'No bookmark action specified. Use --add, --remove, or --list.' };
}
