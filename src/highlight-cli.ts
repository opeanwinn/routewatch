import { highlightDiffLine, highlightMatch, colorize } from "./highlight";

export interface HighlightFlags {
  query?: string;
  diff?: boolean;
  noColor?: boolean;
}

export function parseHighlightFlags(args: string[]): HighlightFlags {
  const flags: HighlightFlags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--query" || args[i] === "-q") {
      flags.query = args[++i];
    } else if (args[i] === "--diff") {
      flags.diff = true;
    } else if (args[i] === "--no-color") {
      flags.noColor = true;
    }
  }
  return flags;
}

export function runHighlightCli(lines: string[], flags: HighlightFlags): string[] {
  if (flags.noColor) {
    return lines;
  }

  if (flags.diff) {
    return lines.map(highlightDiffLine);
  }

  if (flags.query) {
    return lines.map((line) => highlightMatch(line, flags.query!));
  }

  return lines;
}

export const highlightHelpText = [
  colorize("highlight", "bold") + " — colorize route output",
  "",
  "Options:",
  "  --query, -q <term>   Highlight matching text in yellow",
  "  --diff               Highlight added (+) lines green, removed (-) lines red",
  "  --no-color           Disable all color output",
].join("\n");
