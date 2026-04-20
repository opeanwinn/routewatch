import { mergeTrees, formatMergeResult } from "./merge";
import { RouteNode } from "./tree";

function makeNode(
  segment: string,
  path: string,
  type: RouteNode["type"] = "page",
  children: RouteNode[] = []
): RouteNode {
  return { segment, path, type, children };
}

describe("mergeTrees", () => {
  it("returns the base tree unchanged when both trees are identical", () => {
    const base = makeNode("app", "/", "layout", [
      makeNode("about", "/about"),
    ]);
    const next = makeNode("app", "/", "layout", [
      makeNode("about", "/about"),
    ]);
    const { merged, added, removed, conflicts } = mergeTrees(base, next);
    expect(merged.segment).toBe("app");
    expect(added).toHaveLength(0);
    expect(removed).toHaveLength(0);
    expect(conflicts).toHaveLength(0);
  });

  it("tracks nodes added in next", () => {
    const base = makeNode("app", "/", "layout", []);
    const next = makeNode("app", "/", "layout", [
      makeNode("blog", "/blog"),
    ]);
    const { added, removed } = mergeTrees(base, next);
    expect(added).toContain("/blog");
    expect(removed).toHaveLength(0);
  });

  it("tracks nodes removed in next", () => {
    const base = makeNode("app", "/", "layout", [
      makeNode("shop", "/shop"),
    ]);
    const next = makeNode("app", "/", "layout", []);
    const { removed, added } = mergeTrees(base, next);
    expect(removed).toContain("/shop");
    expect(added).toHaveLength(0);
  });

  it("records a conflict when node type changes", () => {
    const base = makeNode("app", "/", "layout", [
      makeNode("dashboard", "/dashboard", "page"),
    ]);
    const next = makeNode("app", "/", "layout", [
      makeNode("dashboard", "/dashboard", "route"),
    ]);
    const { conflicts } = mergeTrees(base, next);
    expect(conflicts).toContain("/dashboard");
  });

  it("recursively merges nested children", () => {
    const base = makeNode("app", "/", "layout", [
      makeNode("a", "/a", "layout", [makeNode("b", "/a/b")]),
    ]);
    const next = makeNode("app", "/", "layout", [
      makeNode("a", "/a", "layout", [
        makeNode("b", "/a/b"),
        makeNode("c", "/a/c"),
      ]),
    ]);
    const { merged, added } = mergeTrees(base, next);
    expect(added).toContain("/a/c");
    const aNode = merged.children?.find((c) => c.segment === "a");
    expect(aNode?.children).toHaveLength(2);
  });
});

describe("formatMergeResult", () => {
  it("shows 'No differences found' for identical trees", () => {
    const base = makeNode("app", "/");
    const next = makeNode("app", "/");
    const result = mergeTrees(base, next);
    expect(formatMergeResult(result)).toBe("No differences found.");
  });

  it("formats added and removed sections", () => {
    const base = makeNode("app", "/", "layout", [makeNode("old", "/old")]);
    const next = makeNode("app", "/", "layout", [makeNode("new", "/new")]);
    const result = mergeTrees(base, next);
    const output = formatMergeResult(result);
    expect(output).toContain("+ /new");
    expect(output).toContain("- /old");
  });
});
