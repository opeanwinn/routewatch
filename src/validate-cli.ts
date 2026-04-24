import { validateRoutes, formatValidationResult } from './validate';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';

export interface ValidateFlags {
  dir: string;
  json: boolean;
  strict: boolean;
}

export function parseValidateFlags(args: string[]): ValidateFlags {
  const flags: ValidateFlags = { dir: '.', json: false, strict: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '-d') {
      flags.dir = args[++i] ?? '.';
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--strict') {
      flags.strict = true;
    } else if (!arg.startsWith('-')) {
      flags.dir = arg;
    }
  }
  return flags;
}

export async function runValidateCli(args: string[]): Promise<number> {
  const flags = parseValidateFlags(args);

  let routes;
  try {
    routes = scanAppRouter(flags.dir);
  } catch (err: any) {
    console.error(`Error scanning directory: ${err.message}`);
    return 1;
  }

  const tree = buildTree(routes);
  const result = validateRoutes(tree);

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatValidationResult(result));
  }

  if (flags.strict && result.issues.length > 0) return 1;
  return result.valid ? 0 : 1;
}
