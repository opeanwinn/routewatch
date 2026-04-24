import type { RouteNode } from './tree';

export interface ValidationIssue {
  path: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const RESERVED_SEGMENTS = ['api', '_app', '_document', '_error'];
const MAX_SEGMENT_LENGTH = 64;
const VALID_SEGMENT_RE = /^[\w\-\.\(\)\[\]@]+$/;

export function validateSegment(segment: string, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (segment.length > MAX_SEGMENT_LENGTH) {
    issues.push({ path, severity: 'warning', message: `Segment "${segment}" exceeds ${MAX_SEGMENT_LENGTH} characters` });
  }
  if (!VALID_SEGMENT_RE.test(segment)) {
    issues.push({ path, severity: 'error', message: `Segment "${segment}" contains invalid characters` });
  }
  return issues;
}

export function validateNode(node: RouteNode, parentPath = ''): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

  if (node.name && node.name !== '/') {
    issues.push(...validateSegment(node.name, currentPath));
  }

  const childNames = (node.children ?? []).map(c => c.name);
  const duplicates = childNames.filter((n, i) => childNames.indexOf(n) !== i);
  for (const dup of new Set(duplicates)) {
    issues.push({ path: currentPath, severity: 'error', message: `Duplicate child segment "${dup}"` });
  }

  const hasCatchAll = childNames.some(n => n.startsWith('[...') || n.startsWith('[[...'));
  const hasDynamic = childNames.some(n => n.startsWith('[') && !n.startsWith('[...') && !n.startsWith('[[...'));
  if (hasCatchAll && hasDynamic) {
    issues.push({ path: currentPath, severity: 'warning', message: 'Mixing dynamic and catch-all segments may cause ambiguous routing' });
  }

  for (const child of node.children ?? []) {
    issues.push(...validateNode(child, currentPath));
  }

  return issues;
}

export function validateRoutes(root: RouteNode): ValidationResult {
  const issues = validateNode(root);
  return { valid: issues.every(i => i.severity !== 'error'), issues };
}

export function formatValidationResult(result: ValidationResult): string {
  if (result.issues.length === 0) return '✓ No validation issues found.';
  const lines = result.issues.map(i => `  [${i.severity.toUpperCase()}] ${i.path}: ${i.message}`);
  const summary = `${result.issues.filter(i => i.severity === 'error').length} error(s), ${result.issues.filter(i => i.severity === 'warning').length} warning(s)`;
  return [`Validation: ${summary}`, ...lines].join('\n');
}
