import { watch, FSWatcher } from 'fs';
import { resolve } from 'path';
import { scanAppRouter } from './scanner';
import { RouteNode } from './tree';

export type WatchCallback = (tree: RouteNode) => void;

export interface WatchHandle {
  stop: () => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debounce(fn: () => void, ms: number) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, ms);
}

export function watchAppRouter(
  appDir: string,
  callback: WatchCallback,
  debounceMs = 300
): WatchHandle {
  const absDir = resolve(appDir);
  let watcher: FSWatcher | null = null;

  const trigger = () => {
    debounce(() => {
      const tree = scanAppRouter(absDir);
      callback(tree);
    }, debounceMs);
  };

  try {
    watcher = watch(absDir, { recursive: true }, (_event, _filename) => {
      trigger();
    });
  } catch {
    throw new Error(`Cannot watch directory: ${absDir}`);
  }

  return {
    stop: () => {
      if (watcher) {
        watcher.close();
        watcher = null;
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    },
  };
}

export function pollAppRouter(
  appDir: string,
  callback: WatchCallback,
  intervalMs = 1000
): WatchHandle {
  const absDir = resolve(appDir);
  let lastJson = '';
  const id = setInterval(() => {
    const tree = scanAppRouter(absDir);
    const json = JSON.stringify(tree);
    if (json !== lastJson) {
      lastJson = json;
      callback(tree);
    }
  }, intervalMs);
  return { stop: () => clearInterval(id) };
}
