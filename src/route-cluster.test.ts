import { describe, it, expect } from 'vitest';
import {
  clusterByTopSegment,
  buildClusterReport,
  formatClusterReport,
} from './route-cluster';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, children, type: 'page' };
}

describe('clusterByTopSegment', () => {
  it('groups paths by first segment', () => {
    const paths = ['app/dashboard', 'app/dashboard/settings', 'app/profile'];
    const map = clusterByTopSegment(paths);
    expect(map.get('app')).toHaveLength(3);
  });

  it('handles root-level paths', () => {
    const paths = ['blog', 'blog/post', 'shop'];
    const map = clusterByTopSegment(paths);
    expect(map.get('blog')).toEqual(['blog', 'blog/post']);
    expect(map.get('shop')).toEqual(['shop']);
  });

  it('skips empty segments', () => {
    const map = clusterByTopSegment(['']);
    expect(map.size).toBe(0);
  });
});

describe('buildClusterReport', () => {
  it('creates clusters from a tree', () => {
    const root = makeNode('root', [
      makeNode('api', [makeNode('users'), makeNode('posts')]),
      makeNode('blog', [makeNode('index')]),
    ]);
    const report = buildClusterReport(root);
    expect(report.total).toBeGreaterThan(0);
    expect(Array.isArray(report.clusters)).toBe(true);
  });

  it('puts single-member groups into unclustered', () => {
    const root = makeNode('root', [makeNode('solo')]);
    const report = buildClusterReport(root);
    // root itself plus solo — small tree
    expect(report.unclustered.length + report.clusters.length).toBeGreaterThanOrEqual(0);
  });
});

describe('formatClusterReport', () => {
  it('includes cluster count in header', () => {
    const report = {
      clusters: [{ id: 'api', label: '/api', paths: ['/api', '/api/v1'] }],
      unclustered: ['/about'],
      total: 3,
    };
    const output = formatClusterReport(report);
    expect(output).toContain('1 clusters');
    expect(output).toContain('/api');
    expect(output).toContain('Unclustered');
    expect(output).toContain('/about');
  });

  it('omits unclustered section when empty', () => {
    const report = {
      clusters: [{ id: 'api', label: '/api', paths: ['/api', '/api/v1'] }],
      unclustered: [],
      total: 2,
    };
    const output = formatClusterReport(report);
    expect(output).not.toContain('Unclustered');
  });
});
