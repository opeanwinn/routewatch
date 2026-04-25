import { describe, it, expect } from "vitest";
import type { RouteNode } from "./tree";
import {
  scoreHotspot,
  buildHotspotReport,
  formatHotspotReport,
} from "./route-hotspot";

function makeNode(
  name: string,
  children: RouteNode[] = [],
  type: RouteNode["type"] = "page"
): RouteNode {
  return { name, children, type };
}

describe("scoreHotspot", () => {
  it("returns zero score for simple static route", () => {
    const node = makeNode("about");
    const result = scoreHotspot(node);
    expect(result.score).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });

  it("scores dynamic segments", () => {
    const node = makeNode("users/[id]");
    const result = scoreHotspot(node);
    expect(result.score).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes("dynamic"))).toBe(true);
  });

  it("scores catch-all segments higher", () => {
    const plain = scoreHotspot(makeNode("a/[id]"));
    const catchAll = scoreHotspot(makeNode("a/[...slug]"));
    expect(catchAll.score).toBeGreaterThan(plain.score);
  });

  it("scores deep nesting", () => {
    const node = makeNode("a/b/c/d/e/f");
    const result = scoreHotspot(node);
    expect(result.reasons.some((r) => r.includes("deep"))).toBe(true);
  });

  it("scores parallel routes", () => {
    const node = makeNode("@modal/login");
    const result = scoreHotspot(node);
    expect(result.reasons.some((r) => r.includes("parallel"))).toBe(true);
  });

  it("scores nodes with many children", () => {
    const children = Array.from({ length: 8 }, (_, i) => makeNode(`child${i}`));
    const node = makeNode("hub", children);
    const result = scoreHotspot(node);
    expect(result.reasons.some((r) => r.includes("children"))).toBe(true);
  });
});

describe("buildHotspotReport", () => {
  it("returns empty topN when no hotspots", () => {
    const root = makeNode("app", [makeNode("about"), makeNode("contact")]);
    const report = buildHotspotReport(root, 5);
    expect(report.topN).toHaveLength(0);
  });

  it("limits topN correctly", () => {
    const children = [
      makeNode("[a]/[b]/[c]/[d]/[e]"),
      makeNode("[x]/[y]"),
      makeNode("static"),
    ];
    const root = makeNode("app", children);
    const report = buildHotspotReport(root, 2);
    expect(report.topN.length).toBeLessThanOrEqual(2);
  });

  it("sorts by score descending", () => {
    const children = [makeNode("[a]"), makeNode("[a]/[b]/[c]/[d]/[e]/[f]")];
    const root = makeNode("app", children);
    const report = buildHotspotReport(root, 5);
    for (let i = 1; i < report.topN.length; i++) {
      expect(report.topN[i - 1].score).toBeGreaterThanOrEqual(
        report.topN[i].score
      );
    }
  });
});

describe("formatHotspotReport", () => {
  it("returns no-hotspot message for empty report", () => {
    const out = formatHotspotReport({ entries: [], topN: [] });
    expect(out).toMatch(/no hotspots/i);
  });

  it("includes path and score in output", () => {
    const entry = { path: "users/[id]", score: 4, reasons: ["1 dynamic segment(s)"] };
    const out = formatHotspotReport({ entries: [entry], topN: [entry] });
    expect(out).toContain("users/[id]");
    expect(out).toContain("score: 4");
  });
});
