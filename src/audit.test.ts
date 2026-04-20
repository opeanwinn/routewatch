import { describe, it, expect } from "vitest";
import { auditRoutes, formatAuditResult, AuditResult } from "./audit";
import { RouteNode } from "./tree";

function makeNode(
  name: string,
  type: RouteNode["type"] = "layout",
  children: RouteNode[] = []
): RouteNode {
  return { name, type, children };
}

describe("auditRoutes", () => {
  it("returns no issues for a clean tree", () => {
    const root = makeNode("/", "layout", [
      makeNode("dashboard", "page"),
      makeNode("settings", "page"),
    ]);
    const result = auditRoutes(root);
    expect(result.issues).toHaveLength(0);
    expect(result.failed).toBe(0);
  });

  it("warns on more than 3 dynamic segments", () => {
    const root = makeNode("/", "layout", [
      makeNode("[a]", "layout", [
        makeNode("[b]", "layout", [
          makeNode("[c]", "layout", [
            makeNode("[d]", "page"),
          ]),
        ]),
      ]),
    ]);
    const result = auditRoutes(root);
    const dynamic = result.issues.filter((i) =>
      i.message.includes("dynamic segments")
    );
    expect(dynamic.length).toBeGreaterThan(0);
    expect(dynamic[0].severity).toBe("warn");
  });

  it("errors on duplicate adjacent segments", () => {
    const root = makeNode("/", "layout", [
      makeNode("shop", "layout", [
        makeNode("shop", "page"),
      ]),
    ]);
    const result = auditRoutes(root);
    const dup = result.issues.filter((i) =>
      i.message.includes("Duplicate adjacent")
    );
    expect(dup.length).toBeGreaterThan(0);
    expect(dup[0].severity).toBe("error");
  });

  it("warns on nested catch-all", () => {
    const root = makeNode("/", "layout", [
      makeNode("docs", "layout", [
        makeNode("[...slug]", "page"),
      ]),
    ]);
    const result = auditRoutes(root);
    const catchAll = result.issues.filter((i) =>
      i.message.includes("Catch-all")
    );
    expect(catchAll.length).toBeGreaterThan(0);
    expect(catchAll[0].severity).toBe("warn");
  });
});

describe("formatAuditResult", () => {
  it("shows pass message when no issues", () => {
    const result: AuditResult = { issues: [], passed: 5, failed: 0 };
    const output = formatAuditResult(result);
    expect(output).toContain("No issues found");
    expect(output).toContain("5 passed");
  });

  it("formats issues with severity icons", () => {
    const result: AuditResult = {
      issues: [
        { path: "/a/b", severity: "error", message: "some error" },
        { path: "/c/d", severity: "warn", message: "some warning" },
      ],
      passed: 3,
      failed: 2,
    };
    const output = formatAuditResult(result);
    expect(output).toContain("✖");
    expect(output).toContain("⚠");
    expect(output).toContain("some error");
    expect(output).toContain("some warning");
  });
});
