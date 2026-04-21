import { LintRule, LintIssue } from './lint';
import { RouteNode } from './tree';

/**
 * Additional / optional lint rules that can be composed into a custom lint pass.
 */

export const noIndexOnlyDynamic: LintRule = {
  id: 'no-index-only-dynamic',
  description: 'Dynamic segments should have at least one non-index child',
  check: (node: RouteNode, path: string): LintIssue | null => {
    const isDynamic = node.name?.startsWith('[') && node.name?.endsWith(']');
    if (!isDynamic) return null;
    const nonIndexChildren = (node.children ?? []).filter(c => c.name !== 'page' && c.name !== 'index');
    if (nonIndexChildren.length === 0 && (node.children ?? []).length > 0) {
      return {
        ruleId: 'no-index-only-dynamic',
        severity: 'info',
        path,
        message: `Dynamic segment "${node.name}" only has index/page children`,
      };
    }
    return null;
  },
};

export const noEmptyGroup: LintRule = {
  id: 'no-empty-group',
  description: 'Route groups should not be empty',
  check: (node: RouteNode, path: string): LintIssue | null => {
    const isGroup = node.name?.startsWith('(') && node.name?.endsWith(')');
    if (isGroup && (node.children ?? []).length === 0) {
      return {
        ruleId: 'no-empty-group',
        severity: 'warn',
        path,
        message: `Route group "${node.name}" is empty`,
      };
    }
    return null;
  },
};

export const noConsecutiveDynamicSegments: LintRule = {
  id: 'no-consecutive-dynamic-segments',
  description: 'Avoid consecutive dynamic segments in a route path',
  check: (_node: RouteNode, path: string): LintIssue | null => {
    const segments = path.split('/').filter(Boolean);
    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i].startsWith('[') && segments[i + 1].startsWith('[')) {
        return {
          ruleId: 'no-consecutive-dynamic-segments',
          severity: 'warn',
          path,
          message: `Consecutive dynamic segments at "${segments[i]}/${segments[i + 1]}"`,
        };
      }
    }
    return null;
  },
};

export const allOptionalRules: LintRule[] = [
  noIndexOnlyDynamic,
  noEmptyGroup,
  noConsecutiveDynamicSegments,
];
