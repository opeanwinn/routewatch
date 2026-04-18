import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as watcherMod from './watcher';
import * as printerMod from './printer';
import * as statsMod from './stats';
import { startLive } from './live';
import { RouteNode } from './tree';

const fakeTree: RouteNode = { name: 'app', path: '/', children: [], isPage: false };
const fakeHandle = { stop: vi.fn() };

beforeEach(() => {
  vi.spyOn(watcherMod, 'watchAppRouter').mockReturnValue(fakeHandle);
  vi.spyOn(watcherMod, 'pollAppRouter').mockReturnValue(fakeHandle);
  vi.spyOn(printerMod, 'printTreeToConsole').mockImplementation(() => {});
  vi.spyOn(statsMod, 'computeStats').mockReturnValue({ pages: 0, layouts: 0, groups: 0, dynamics: 0, depth: 0 });
  vi.spyOn(statsMod, 'formatStats').mockReturnValue('');
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('startLive', () => {
  it('uses watchAppRouter by default', () => {
    const handle = startLive({ appDir: '/app' });
    expect(watcherMod.watchAppRouter).toHaveBeenCalledWith('/app', expect.any(Function), 300);
    expect(handle).toBe(fakeHandle);
  });

  it('uses pollAppRouter when poll=true', () => {
    startLive({ appDir: '/app', poll: true, pollInterval: 500 });
    expect(watcherMod.pollAppRouter).toHaveBeenCalledWith('/app', expect.any(Function), 500);
  });

  it('calls printTreeToConsole and stats on handler invocation', () => {
    vi.spyOn(watcherMod, 'watchAppRouter').mockImplementation((_dir, cb) => {
      cb(fakeTree);
      return fakeHandle;
    });
    startLive({ appDir: '/app' });
    expect(printerMod.printTreeToConsole).toHaveBeenCalledWith(fakeTree);
    expect(statsMod.computeStats).toHaveBeenCalledWith(fakeTree);
  });

  it('skips stats when quiet=true', () => {
    vi.spyOn(watcherMod, 'watchAppRouter').mockImplementation((_dir, cb) => {
      cb(fakeTree);
      return fakeHandle;
    });
    startLive({ appDir: '/app', quiet: true });
    expect(statsMod.computeStats).not.toHaveBeenCalled();
  });
});
