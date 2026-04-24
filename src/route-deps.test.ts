import { describe, it, expect } from "vitest";
import {
  buildDepsFromTree,
  findOrphans,
  findSharedLayouts,
  buildRouteDepsReport,
  formatRouteDepsReport,
} from "./route-deps";
import { RouteNode } from "./tree";

function makeNode(
  path: string,
  type: RouteNode["type"] = "page",
  children: RouteNode[] = []
): RouteNode {
  return { path, name: path.split("/").pop() ?? path, type, children };
}

describe("buildDepsFromTree", () => {
  it("returns empty for leaf node", () => {
    const root = makeNode("/");
    expect(buildDepsFromTree(root)).toEqual([]);
  });

  it("creates dep for each child", () => {
    const root = makeNode("/", "layout", [
      makeNode("/about", "page"),
      makeNode("/contact", "page"),
    ]);
    const deps = buildDepsFromTree(root);
    expect(deps).toHaveLength(2);
    expect(deps[0]).toMatchObject({ from: "/", to: "/about" });
    expect(deps[1]).toMatchObject({ from: "/", to: "/contact" });
  });

  it("handles nested children", () => {
    const root = makeNode("/", "layout", [
      makeNode("/blog", "layout", [makeNode("/blog/post", "page")]),
    ]);
    const deps = buildDepsFromTree(root);
    expect(deps).toHaveLength(2);
  });
});

describe("findOrphans", () => {
  it("returns paths not connected by any dep", () => {
    const deps = [{ from: "/", to: "/about", kind: "page" as const }];
    const all = ["/", "/about", "/lost"];
    expect(findOrphans(deps, all)).toEqual(["/lost"]);
  });

  it("returns empty when all paths connected", () => {
    const deps = [{ from: "/", to: "/about", kind: "page" as const }];
    expect(findOrphans(deps, ["/", "/about"])).toEqual([]);
  });
});

describe("findSharedLayouts", () => {
  it("detects layouts used more than once", () => {
    const deps = [
      { from: "/", to: "/a", kind: "layout" as const },
      { from: "/", to: "/b", kind: "layout" as const },
    ];
    expect(findSharedLayouts(deps)).toContain("/");
  });

  it("ignores non-layout deps", () => {
    const deps = [
      { from: "/", to: "/a", kind: "page" as const },
      { from: "/", to: "/b", kind: "page" as const },
    ];
    expect(findSharedLayouts(deps)).toEqual([]);
  });
});

describe("formatRouteDepsReport", () => {
  it("includes dep count", () => {
    const root = makeNode("/", "layout", [makeNode("/a")]);
    const report = buildRouteDepsReport(root);
    const out = formatRouteDepsReport(report);
    expect(out).toContain("Dependencies:");
  });
});
