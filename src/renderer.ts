import { RouteDiff, ChangeType } from './differ';

const COLORS: Record<ChangeType, string> = {
  added: '\x1b[32m',
  removed: '\x1b[31m',
  unchanged: '\x1b[37m',
};
const RESET = '\x1b[0m';
const SYMBOLS: Record<ChangeType, string> = {
  added: '+',
  removed: '-',
  unchanged: ' ',
};

function metaSummary(meta?: RouteDiff['meta']): string {
  if (!meta) return '';
  const flags = [
    meta.hasPage && 'page',
    meta.hasLayout && 'layout',
    meta.hasLoading && 'loading',
    meta.hasError && 'error',
  ].filter(Boolean);
  return flags.length ? ` [${flags.join(', ')}]` : '';
}

export function renderDiff(diffs: RouteDiff[], useColor = true): string {
  const lines = diffs.map(diff => {
    const sym = SYMBOLS[diff.change];
    const color = useColor ? COLORS[diff.change] : '';
    const reset = useColor ? RESET : '';
    const meta = metaSummary(diff.meta);
    return `${color}${sym} ${diff.path}${meta}${reset}`;
  });
  return lines.join('\n');
}

export function renderSummary(diffs: RouteDiff[]): string {
  const added = diffs.filter(d => d.change === 'added').length;
  const removed = diffs.filter(d => d.change === 'removed').length;
  const unchanged = diffs.filter(d => d.change === 'unchanged').length;
  return `Summary: +${added} added, -${removed} removed, ${unchanged} unchanged`;
}
