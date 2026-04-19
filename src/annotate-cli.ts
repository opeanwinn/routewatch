import { addAnnotation, removeAnnotation, formatAnnotations, createAnnotation, AnnotationMap } from './annotate';

export interface AnnotateFlags {
  add?: { route: string; note: string; author?: string };
  remove?: string;
  list?: boolean;
}

export function parseAnnotateFlags(args: string[]): AnnotateFlags {
  const flags: AnnotateFlags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--add' && args[i + 1] && args[i + 2]) {
      flags.add = { route: args[i + 1], note: args[i + 2], author: args[i + 3]?.startsWith('--') ? undefined : args[i + 3] };
      i += 2;
    } else if (args[i] === '--remove' && args[i + 1]) {
      flags.remove = args[++i];
    } else if (args[i] === '--list') {
      flags.list = true;
    }
  }
  return flags;
}

export function runAnnotateCli(args: string[], map: AnnotationMap): { map: AnnotationMap; output: string } {
  const flags = parseAnnotateFlags(args);
  let current = { ...map };
  let output = '';

  if (flags.add) {
    const { route, note, author } = flags.add;
    const annotation = createAnnotation(route, note, author);
    current = addAnnotation(current, annotation);
    output = `Annotation added for ${route}`;
  } else if (flags.remove) {
    current = removeAnnotation(current, flags.remove);
    output = `Annotation removed for ${flags.remove}`;
  } else if (flags.list) {
    output = formatAnnotations(current);
  } else {
    output = 'Usage: annotate [--add <route> <note> [author]] [--remove <route>] [--list]';
  }

  return { map: current, output };
}
