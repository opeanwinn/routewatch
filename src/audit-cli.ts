import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";
import { auditRoutes, formatAuditResult } from "./audit";

export interface AuditFlags {
  dir: string;
  json: boolean;
  failOnError: boolean;
}

export function parseAuditFlags(args: string[]): AuditFlags {
  const flags: AuditFlags = {
    dir: "app",
    json: false,
    failOnError: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === "--dir" || arg === "-d") && args[i + 1]) {
      flags.dir = args[++i];
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--fail-on-error") {
      flags.failOnError = true;
    }
  }

  return flags;
}

export async function runAuditCli(args: string[]): Promise<void> {
  const flags = parseAuditFlags(args);

  const entries = scanAppRouter(flags.dir);
  const root = buildTree(entries);
  const result = auditRoutes(root);

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatAuditResult(result));
  }

  if (flags.failOnError && result.issues.some((i) => i.severity === "error")) {
    process.exit(1);
  }
}
