import { describe, it, expect } from "vitest";
import {
  scoreComplexity,
  buildComplexityReport,
  formatComplexityReport,
} from "./route-complexity";
import { RouteNode } from "./tree";

function makeNode(path: string, depth: number): RouteNode {
  return { path, name: path.split("/").pop() ?? "", depth, children: [], type: "page" };
}

describe("scoreComplexity", () => {
  it("grades a static root route as A", () => {
    const result = scoreComplexity("/", 0);
    expect(result.grade).toBe("A");
    expect(result.score).toBe(0);
  });

  it("counts dynamic segments", () => {
    const result = scoreComplexity("/blog/[slug]", 2);
    expect(result.dynamicSegments).toBe(1);
    expect(result.score).toBe(4); // 1*2 + depth 2
  });

  it("counts catch-all segments with higher weight", () => {
    const result = scoreComplexity("/docs/[...slug]", 2);
    expect(result.catchAllSegments).toBe(1);
    expect(result.score).toBe(6); // 1*4 + depth 2
  });

  it("counts optional catch-all segments", () => {
    const result = scoreComplexity("/shop/[[...filters]]", 2);
    expect(result.optionalSegments).toBe(1);
    expect(result.score).toBe(5); // 1*3 + depth 2
  });

  it("assigns F grade for very complex routes", () => {
    const result = scoreComplexity("/a/[b]/[...c]/[[...d]]", 4);
    expect(result.grade).toBe("F");
  });
});

describe("buildComplexityReport", () => {
  it("returns empty report for empty input", () => {
    const report = buildComplexityReport([]);
    expect(report.entries).toHaveLength(0);
    expect(report.averageScore).toBe(0);
  });

  it("computes min/max/average correctly", () => {
    const nodes = [
      makeNode("/", 0),
      makeNode("/blog/[slug]", 2),
      makeNode("/docs/[...rest]", 2),
    ];
    const report = buildComplexityReport(nodes);
    expect(report.minScore).toBe(0);
    expect(report.maxScore).toBeGreaterThan(0);
    expect(report.averageScore).toBeGreaterThanOrEqual(0);
  });
});

describe("formatComplexityReport", () => {
  it("includes header and summary line", () => {
    const nodes = [makeNode("/", 0), makeNode("/about", 1)];
    const report = buildComplexityReport(nodes);
    const output = formatComplexityReport(report);
    expect(output).toContain("Route Complexity Report");
    expect(output).toContain("avg=");
    expect(output).toContain("total=2");
  });
});
