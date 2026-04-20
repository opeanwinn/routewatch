// pin.ts — bookmark/pin specific routes for quick reference

export interface PinStore {
  pins: Record<string, string>; // name -> route path
}

export function emptyPinStore(): PinStore {
  return { pins: {} };
}

export function pinRoute(store: PinStore, name: string, route: string): PinStore {
  return { pins: { ...store.pins, [name]: route } };
}

export function unpinRoute(store: PinStore, name: string): PinStore {
  const pins = { ...store.pins };
  delete pins[name];
  return { pins };
}

export function getPin(store: PinStore, name: string): string | undefined {
  return store.pins[name];
}

export function listPins(store: PinStore): Array<{ name: string; route: string }> {
  return Object.entries(store.pins).map(([name, route]) => ({ name, route }));
}

export function formatPins(store: PinStore): string {
  const entries = listPins(store);
  if (entries.length === 0) return '(no pins)';
  return entries.map(({ name, route }) => `  ${name.padEnd(16)} ${route}`).join('\n');
}

export function hasPin(store: PinStore, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(store.pins, name);
}
