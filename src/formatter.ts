import { DiffResult } from './differ';

export type OutputFormat = 'text' | 'json' | 'markdown';

export function formatAsJson(diff: DiffResult): string {
  return JSON.stringify(diff, null, 2);
}

export function formatAsMarkdown(diff: DiffResult): string {
  const lines: string[] = [];

  lines.push('# RouteWatch Diff Report');
  lines.push('');
  lines.push(`**Base branch:** ${diff.base}`);
  lines.push(`**Compare branch:** ${diff.compare}`);
  lines.push('');

  if (diff.added.length > 0) {
    lines.push('## Added Routes');
    for (const route of diff.added) {
      lines.push(`- \`${route}\``);
    }
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('## Removed Routes');
    for (const route of diff.removed) {
      lines.push(`- \`${route}\``);
    }
    lines.push('');
  }

  if (diff.unchanged.length > 0) {
    lines.push('## Unchanged Routes');
    for (const route of diff.unchanged) {
      lines.push(`- \`${route}\``);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push(`*${diff.added.length} added, ${diff.removed.length} removed, ${diff.unchanged.length} unchanged*`);

  return lines.join('\n');
}

export function formatOutput(diff: DiffResult, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return formatAsJson(diff);
    case 'markdown':
      return formatAsMarkdown(diff);
    case 'text':
    default:
      // Delegate to renderer for text output
      return formatAsJson(diff); // fallback; renderer handles text in cli
  }
}
