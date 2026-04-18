import { buildAliasMap, listAliases, AliasMap } from './alias';

export interface AliasFlags {
  aliases: AliasMap;
  list: boolean;
}

export const aliasHelpText = `
Alias options:
  --alias <alias=path>   Map a route path to a display alias (repeatable)
  --list-aliases         Print all active aliases and exit
`.trim();

export function parseAliasFlags(args: string[]): AliasFlags {
  const pairs: string[] = [];
  let list = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--alias' && args[i + 1]) {
      pairs.push(args[++i]);
    } else if (args[i].startsWith('--alias=')) {
      pairs.push(args[i].slice('--alias='.length));
    } else if (args[i] === '--list-aliases') {
      list = true;
    }
  }

  return { aliases: buildAliasMap(pairs), list };
}

export function handleAliasFlags(flags: AliasFlags): boolean {
  if (flags.list) {
    const lines = listAliases(flags.aliases);
    if (lines.length === 0) {
      console.log('No aliases defined.');
    } else {
      lines.forEach(l => console.log(l));
    }
    return true;
  }
  return false;
}
