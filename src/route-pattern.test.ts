import { describe, it, expect } from "vitest";
import type { RouteNode } from "./tree";
import {
  classifyPattern,
  buildPatternReport,
  formatPatternReport,
} from "./route-pattern";

function makeNode(
  name: string,
  children: RouteNode[] = []
): RouteNode {
  return { name, children, type: "page" };
}

describe("classifyPattern", () => {
  it("classifies static segments", () => {
    expect(classifyPattern("about")).toBe("static");
    expect(classifyPattern("dashboard")).toBe("static");
  });

  it("classifies dynamic segments", () => {
    expect(classifyPattern("[id]")).toBe("dynamic");
    expect(classifyPattern("[slug]")).toBe("dynamic");
  });

  it("classifies catch-all segments", () => {
    expect(classifyPattern("[...rest]")).toBe("catch-all");
  });

  it("classifies optional catch-all segments", () => {
    expect(classifyPattern("[[...rest]]")).toBe("optional-catch-all");
  });

  it("classifies route groups", () => {
    expect(classifyPattern("(marketing)")).toBe("group");
    expect(classifyPattern("(auth)")).toBe("group");
  });

  it("classifies parallel routes", () => {
    expect(classifyPattern("@modal")).toBe("parallel");
  });

  it("classifies intercepted routes", () => {
    expect(classifyPattern("(..)photo")).toBe("intercepted");
  });
});

describe("buildPatternReport", () => {
  it("counts segment kinds correctly", () => {
    const root = makeNode("app", [
      makeNode("about"),
      makeNode("[id]", [makeNode("edit")]),
      makeNode("[...rest]"),
      makeNode("(auth)", [makeNode("login")]),
      makeNode("@modal"),
    ]);
    const report = buildPatternReport(root);
    expect(report.counts["static"]).toBeGreaterThanOrEqual(3);
    expect(report.counts["dynamic"]).toBe(1);
    expect(report.counts["catch-all"]).toBe(1);
    expect(report.counts["group"]).toBe(1);
    expect(report.counts["parallel"]).toBe(1);
    expect(report.total).toBe(report.entries.length);
  });

  it("returns zero counts for absent kinds", () => {
    const root = makeNode("app", [makeNode("home")]);
    const report = buildPatternReport(root);
    expect(report.counts["dynamic"]).toBe(0);
    expect(report.counts["intercepted"]).toBe(0);
  });
});

describe("formatPatternReport", () => {
  it("includes header and total", () => {
    const root = makeNode("app", [makeNode("[id]")]);
    const report = buildPatternReport(root);
    const output = formatPatternReport(report);
    expect(output).toContain("Route Pattern Analysis");
    expect(output).toContain("Total segments analyzed");
  });

  it("omits kinds with zero count", () => {
    const root = makeNode("app", [makeNode("about")]);
    const report = buildPatternReport(root);
    const output = formatPatternReport(report);
    expect(output).not.toContain("dynamic");
  });
});
