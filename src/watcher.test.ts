import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import { watchAppRouter, pollAppRouter } from './watcher';
import * as scanner from './scanner';
import { RouteNode } from './tree';

const fakeTree: RouteNode = { name: 'app', path: '/', children: [], isPage: false };

beforeEach(() => {
  vi.spyOn(scanner, 'scanAppRouter').mockReturnValue(fakeTree);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('watchAppRouter', () => {
  it('calls callback when fs.watch fires', () => {
    let watchCb: Function = () => {};
    vi.spyOn(fs, 'watch').mockImplementation((_p: any, _o: any, cb: any) => {
      watchCb = cb;
      return { close: vi.fn() } as any;
    });

    const cb = vi.fn();
    const handle = watchAppRouter('/fake/app', cb, 0);
    watchCb('change', 'page.tsx');

    return new Promise<void>(res => setTimeout(() => {
      expect(cb).toHaveBeenCalledWith(fakeTree);
      handle.stop();
      res();
    }, 50));
  });

  it('stop closes the watcher', () => {
    const closeMock = vi.fn();
    vi.spyOn(fs, 'watch').mockReturnValue({ close: closeMock } as any);
    const handle = watchAppRouter('/fake/app', vi.fn(), 0);
    handle.stop();
    expect(closeMock).toHaveBeenCalled();
  });

  it('throws if watch fails', () => {
    vi.spyOn(fs, 'watch').mockImplementation(() => { throw new Error('nope'); });
    expect(() => watchAppRouter('/bad', vi.fn())).toThrow('Cannot watch directory');
  });
});

describe('pollAppRouter', () => {
  it('calls callback when tree changes', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const handle = pollAppRouter('/fake/app', cb, 500);
    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(1); // same tree, no second call
    handle.stop();
    vi.useRealTimers();
  });
});
