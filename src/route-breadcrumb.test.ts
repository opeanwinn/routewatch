import { describe, it, expect } from "vitest";
import {
  buildBreadcrumbReport,
  formatBreadcrumbReport,
} from "./route-breadcrumb";
import type { RouteNode } from "./tree";

function makeNode(
  name: string,
  children: RouteNode[] = [],
  type: RouteNode["type"] = "page"
): RouteNode {
  return { name, type, children };
}

describe("buildBreadcrumbReport", () => {
  it("handles a single root node", () => {
    const root = makeNode("/");
    const report = buildBreadcrumbReport(root);
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0].path).toBe("/");
    expect(report.entries[0].depth).toBe(0);
    expect(report.maxDepth).toBe(0);
    expect(report.dynamicCount).toBe(0);
  });

  it("computes breadcrumbs for nested routes", () => {
    const root = makeNode("/", [
      makeNode("blog", [
        makeNode("[slug]"),
      ]),
      makeNode("about"),
    ]);
    const report = buildBreadcrumbReport(root);
    const paths = report.entries.map((e) => e.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/blog");
    expect(paths).toContain("/blog/[slug]");
    expect(paths).toContain("/about");
  });

  it("marks dynamic routes correctly", () => {
    const root = makeNode("/", [
      makeNode("[id]"),
    ]);
    const report = buildBreadcrumbReport(root);
    const dynamic = report.entries.find((e) => e.path === "/[id]");
    expect(dynamic?.isDynamic).toBe(true);
    expect(report.dynamicCount).toBe(1);
  });

  it("calculates maxDepth correctly", () => {
    const root = makeNode("/", [
      makeNode("a", [
        makeNode("b", [
          makeNode("c"),
        ]),
      ]),
    ]);
    const report = buildBreadcrumbReport(root);
    expect(report.maxDepth).toBe(3);
  });
});

describe("formatBreadcrumbReport", () => {
  it("includes header with route count and max depth", () => {
    const root = makeNode("/", [makeNode("home")]);
    const report = buildBreadcrumbReport(root);
    const output = formatBreadcrumbReport(report);
    expect(output).toContain("Breadcrumb Report");
    expect(output).toContain("2 routes");
    expect(output).toContain("max depth: 1");
  });

  it("labels dynamic routes", () => {
    const root = makeNode("/", [makeNode("[slug]")]);
    const report = buildBreadcrumbReport(root);
    const output = formatBreadcrumbReport(report);
    expect(output).toContain("[dynamic]");
  });

  it("shows dynamic route count", () => {
    const root = makeNode("/", [makeNode("[id]"), makeNode("static")]);
    const report = buildBreadcrumbReport(root);
    const output = formatBreadcrumbReport(report);
    expect(output).toContain("Dynamic routes: 1");
  });
});
