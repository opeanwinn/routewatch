import { buildAncestorReport, formatAncestorReport } from "./route-ancestors";
import { RouteNode } from "./tree";

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, children, type: "page" };
}

describe("buildAncestorReport", () => {
  it("reports root with no ancestors", () => {
    const root = makeNode("/");
    const report = buildAncestorReport(root);
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0].ancestors).toEqual([]);
    expect(report.entries[0].depth).toBe(0);
  });

  it("reports depth and ancestors for nested routes", () => {
    const root = makeNode("/", [
      makeNode("dashboard", [
        makeNode("settings"),
      ]),
    ]);
    const report = buildAncestorReport(root);
    const settings = report.entries.find((e) => e.path.includes("settings"));
    expect(settings).toBeDefined();
    expect(settings!.depth).toBe(2);
    expect(settings!.ancestors.length).toBeGreaterThan(0);
  });

  it("identifies the deepest route", () => {
    const root = makeNode("/", [
      makeNode("a", [
        makeNode("b", [
          makeNode("c"),
        ]),
      ]),
      makeNode("x"),
    ]);
    const report = buildAncestorReport(root);
    expect(report.deepest?.depth).toBe(3);
  });

  it("computes average depth", () => {
    const root = makeNode("/", [
      makeNode("a"),
      makeNode("b"),
    ]);
    const report = buildAncestorReport(root);
    // root(0), a(1), b(1) => avg = 2/3
    expect(report.averageDepth).toBeCloseTo(2 / 3, 2);
  });

  it("returns zero average depth for single root node", () => {
    const root = makeNode("/");
    const report = buildAncestorReport(root);
    expect(report.averageDepth).toBe(0);
  });
});

describe("formatAncestorReport", () => {
  it("includes header and route paths", () => {
    const root = makeNode("/", [makeNode("about")]);
    const report = buildAncestorReport(root);
    const output = formatAncestorReport(report);
    expect(output).toContain("Route Ancestor Report");
    expect(output).toContain("about");
    expect(output).toContain("Average depth");
  });

  it("shows (root) for entries with no ancestors", () => {
    const root = makeNode("/");
    const report = buildAncestorReport(root);
    const output = formatAncestorReport(report);
    expect(output).toContain("(root)");
  });
});
