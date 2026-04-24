import { describe, it, expect } from "vitest";
import { computeCoverage, summarizeCoverage, formatCoverage } from "./coverage";
import { RouteNode } from "./tree";

function makeNode(name: string, files: string[] = [], children: RouteNode[] = []): RouteNode {
  return { name, type: files.includes("page") ? "page" : "directory", files, children };
}

describe("computeCoverage", () => {
  it("returns empty array for leaf node with no files", () => {
    const node = makeNode("app", [], []);
    expect(computeCoverage(node)).toEqual([]);
  });

  it("scores a fully defined route as 100", () => {
    const node = makeNode("about", ["page", "layout", "loading", "error", "not-found"]);
    const [result] = computeCoverage(node);
    expect(result.score).toBe(100);
    expect(result.hasPage).toBe(true);
    expect(result.hasLayout).toBe(true);
  });

  it("scores a page-only route as 20", () => {
    const node = makeNode("contact", ["page"]);
    const [result] = computeCoverage(node);
    expect(result.score).toBe(20);
    expect(result.hasPage).toBe(true);
    expect(result.hasLayout).toBe(false);
  });

  it("recurses into children", () => {
    const child = makeNode("blog", ["page", "layout"]);
    const root = makeNode("app", [], [child]);
    const results = computeCoverage(root);
    expect(results).toHaveLength(1);
    expect(results[0].route).toContain("blog");
  });
});

describe("summarizeCoverage", () => {
  it("counts fully defined, partial, and bare routes", () => {
    const results = [
      { route: "/a", hasPage: true, hasLayout: true, hasLoading: true, hasError: true, hasNotFound: true, score: 100 },
      { route: "/b", hasPage: true, hasLayout: false, hasLoading: false, hasError: false, hasNotFound: false, score: 20 },
      { route: "/c", hasPage: true, hasLayout: true, hasLoading: false, hasError: false, hasNotFound: false, score: 40 },
    ];
    const summary = summarizeCoverage(results);
    expect(summary.total).toBe(3);
    expect(summary.fullyDefined).toBe(1);
    expect(summary.bare).toBe(1);
    expect(summary.partial).toBe(1);
    expect(summary.averageScore).toBe(53);
  });

  it("returns zero averageScore for empty results", () => {
    expect(summarizeCoverage([]).averageScore).toBe(0);
  });
});

describe("formatCoverage", () => {
  it("includes header and legend", () => {
    const summary = summarizeCoverage([]);
    const output = formatCoverage(summary);
    expect(output).toContain("Route Coverage Report");
    expect(output).toContain("Legend");
  });

  it("renders each route with flags and score", () => {
    const results = [
      { route: "/home", hasPage: true, hasLayout: false, hasLoading: false, hasError: false, hasNotFound: false, score: 20 },
    ];
    const output = formatCoverage(summarizeCoverage(results));
    expect(output).toContain("/home");
    expect(output).toContain("20%");
    expect(output).toContain("P....");
  });
});
