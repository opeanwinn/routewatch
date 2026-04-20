import { describe, it, expect } from "vitest";
import {
  colorize,
  highlightMatch,
  highlightNode,
  stripAnsi,
  highlightDiffLine,
} from "./highlight";
import type { RouteNode } from "./tree";

function makeNode(name: string, type: RouteNode["type"] = "page"): RouteNode {
  return { name, type, children: [] };
}

describe("colorize", () => {
  it("wraps text in ANSI codes", () => {
    const result = colorize("hello", "red");
    expect(result).toContain("hello");
    expect(result).toContain("\x1b[");
  });

  it("stripAnsi removes codes", () => {
    const result = stripAnsi(colorize("hello", "green"));
    expect(result).toBe("hello");
  });
});

describe("highlightMatch", () => {
  it("highlights matching substring", () => {
    const result = highlightMatch("/users/profile", "users");
    expect(stripAnsi(result)).toBe("/users/profile");
    expect(result).toContain("\x1b[");
  });

  it("returns original if no match", () => {
    const result = highlightMatch("/home", "xyz");
    expect(result).toBe("/home");
  });

  it("is case-insensitive", () => {
    const result = highlightMatch("/Users", "users");
    expect(stripAnsi(result)).toBe("/Users");
    expect(result).toContain("\x1b[");
  });
});

describe("highlightNode", () => {
  it("colors page nodes green", () => {
    const node = makeNode("page", "page");
    const result = highlightNode(node);
    expect(result).toContain("\x1b[32m");
  });

  it("colors layout nodes cyan", () => {
    const node = makeNode("layout", "layout");
    const result = highlightNode(node);
    expect(result).toContain("\x1b[36m");
  });

  it("applies query highlight on top", () => {
    const node = makeNode("dashboard", "page");
    const result = highlightNode(node, "dash");
    expect(stripAnsi(result)).toContain("dashboard");
  });
});

describe("highlightDiffLine", () => {
  it("colors added lines green", () => {
    const result = highlightDiffLine("+ /new-route");
    expect(result).toContain("\x1b[32m");
  });

  it("colors removed lines red", () => {
    const result = highlightDiffLine("- /old-route");
    expect(result).toContain("\x1b[31m");
  });

  it("returns unchanged lines as-is", () => {
    const result = highlightDiffLine("  /unchanged");
    expect(result).toBe("  /unchanged");
  });
});
