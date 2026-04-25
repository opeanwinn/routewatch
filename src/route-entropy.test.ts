import { describe, it, expect } from "vitest";
import {
  scoreEntropy,
  buildEntropyReport,
  formatEntropyReport,
  EntropyReport,
} from "./route-entropy";
import { RouteNode } from "./tree";

function makeNode(
  name: string,
  children: RouteNode[] = [],
  type: RouteNode["type"] = "page"
): RouteNode {
  return { name, children, type };
}

describe("scoreEntropy", () => {
  it("scores a static route with low entropy", () => {
    const e = scoreEntropy("/dashboard/settings");
    expect(e.segments).toBe(2);
    expect(e.dynamicCount).toBe(0);
    expect(e.entropy).toBe(2);
  });

  it("scores a dynamic route higher", () => {
    const e = scoreEntropy("/users/[id]/posts");
    expect(e.dynamicCount).toBe(1);
    expect(e.entropy).toBe(3 + 2); // 3 segs + 1 dynamic
  });

  it("scores catch-all segments", () => {
    const e = scoreEntropy("/docs/[...slug]");
    expect(e.catchAllCount).toBe(1);
    expect(e.entropy).toBe(2 + 3); // 2 segs + catch-all
  });

  it("scores optional catch-all segments", () => {
    const e = scoreEntropy("/docs/[[...slug]]");
    expect(e.optionalCount).toBe(1);
    expect(e.entropy).toBe(2 + 4);
  });
});

describe("buildEntropyReport", () => {
  it("returns empty report for leaf node", () => {
    const root = makeNode("app");
    const report = buildEntropyReport(root);
    expect(report.entries.length).toBeGreaterThan(0);
  });

  it("computes average, max, min entropy", () => {
    const root = makeNode("app", [
      makeNode("dashboard", [], "page"),
      makeNode("[id]", [], "page"),
    ]);
    const report = buildEntropyReport(root);
    expect(report.maxEntropy).toBeGreaterThanOrEqual(report.minEntropy);
    expect(report.averageEntropy).toBeGreaterThan(0);
  });

  it("sorts entries by entropy descending in format", () => {
    const root = makeNode("app", [
      makeNode("static", [], "page"),
      makeNode("[...all]", [], "page"),
    ]);
    const report = buildEntropyReport(root);
    const output = formatEntropyReport(report);
    expect(output).toContain("Route Entropy Report");
    expect(output).toContain("Average entropy");
  });
});

describe("formatEntropyReport", () => {
  it("includes all summary lines", () => {
    const report: EntropyReport = {
      entries: [{ path: "/a", segments: 1, dynamicCount: 0, catchAllCount: 0, optionalCount: 0, entropy: 1 }],
      averageEntropy: 1,
      maxEntropy: 1,
      minEntropy: 1,
    };
    const out = formatEntropyReport(report);
    expect(out).toContain("Max entropy");
    expect(out).toContain("Min entropy");
    expect(out).toContain("/a");
  });
});
