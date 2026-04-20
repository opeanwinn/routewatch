import { describe, it, expect } from 'vitest';
import {
  emptyPinStore,
  pinRoute,
  unpinRoute,
  getPin,
  listPins,
  formatPins,
  hasPin,
} from './pin';

describe('pin', () => {
  it('starts empty', () => {
    const store = emptyPinStore();
    expect(listPins(store)).toEqual([]);
  });

  it('pins a route', () => {
    const store = pinRoute(emptyPinStore(), 'home', '/app/page.tsx');
    expect(getPin(store, 'home')).toBe('/app/page.tsx');
  });

  it('unpins a route', () => {
    let store = pinRoute(emptyPinStore(), 'home', '/app/page.tsx');
    store = unpinRoute(store, 'home');
    expect(getPin(store, 'home')).toBeUndefined();
  });

  it('hasPin returns correct boolean', () => {
    const store = pinRoute(emptyPinStore(), 'dash', '/app/dashboard/page.tsx');
    expect(hasPin(store, 'dash')).toBe(true);
    expect(hasPin(store, 'missing')).toBe(false);
  });

  it('listPins returns all entries', () => {
    let store = emptyPinStore();
    store = pinRoute(store, 'a', '/app/a/page.tsx');
    store = pinRoute(store, 'b', '/app/b/page.tsx');
    const list = listPins(store);
    expect(list).toHaveLength(2);
    expect(list.map(p => p.name)).toContain('a');
    expect(list.map(p => p.name)).toContain('b');
  });

  it('formatPins shows placeholder when empty', () => {
    expect(formatPins(emptyPinStore())).toBe('(no pins)');
  });

  it('formatPins lists pins', () => {
    const store = pinRoute(emptyPinStore(), 'home', '/app/page.tsx');
    const out = formatPins(store);
    expect(out).toContain('home');
    expect(out).toContain('/app/page.tsx');
  });
});
