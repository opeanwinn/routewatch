import type { RouteNode } from "./tree";

/** Wraps a string in ANSI color codes */
export function colorize(text: string, color: "red" | "green" | "yellow" | "cyan" | "bold"): string {
  const codes: Record<string, string> = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
  };
  const reset = "\x1b[0m";
  return `${codes[color]}${text}${reset}`;
}

/** Highlights matching segments of a route path */
export function highlightMatch(path: string, query: string): string {
  if (!query) return path;
  const idx = path.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return path;
  const before = path.slice(0, idx);
  const match = path.slice(idx, idx + query.length);
  const after = path.slice(idx + query.length);
  return `${before}${colorize(match, "yellow")}${after}`;
}

/** Returns a highlighted label for a node based on its type */
export function highlightNode(node: RouteNode, query?: string): string {
  const label = node.name;
  const colored =
    node.type === "page"
      ? colorize(label, "green")
      : node.type === "layout"
      ? colorize(label, "cyan")
      : node.type === "dynamic"
      ? colorize(label, "yellow")
      : label;

  if (query) {
    return highlightMatch(colored, query);
  }
  return colored;
}

/** Strips ANSI escape codes from a string */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/** Highlights a diff line based on its prefix (+ / -) */
export function highlightDiffLine(line: string): string {
  if (line.startsWith("+")) return colorize(line, "green");
  if (line.startsWith("-")) return colorize(line, "red");
  return line;
}
