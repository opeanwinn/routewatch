// Annotate routes with custom notes/metadata

export interface Annotation {
  route: string;
  note: string;
  author?: string;
  createdAt: string;
}

export type AnnotationMap = Record<string, Annotation>;

export function createAnnotation(route: string, note: string, author?: string): Annotation {
  return { route, note, author, createdAt: new Date().toISOString() };
}

export function addAnnotation(map: AnnotationMap, annotation: Annotation): AnnotationMap {
  return { ...map, [annotation.route]: annotation };
}

export function removeAnnotation(map: AnnotationMap, route: string): AnnotationMap {
  const next = { ...map };
  delete next[route];
  return next;
}

export function getAnnotation(map: AnnotationMap, route: string): Annotation | undefined {
  return map[route];
}

export function listAnnotations(map: AnnotationMap): Annotation[] {
  return Object.values(map);
}

export function formatAnnotations(map: AnnotationMap): string {
  const entries = listAnnotations(map);
  if (entries.length === 0) return '(no annotations)';
  return entries
    .map(a => `${a.route}: "${a.note}"${a.author ? ` [${a.author}]` : ''}`)
    .join('\n');
}
