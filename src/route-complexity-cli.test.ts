import { describe, it, expect } from "vitest";
import { parseComplexityFlags } from "./route-complexity-cli";

describe("parseComplexityFlags", () => {
  it("returns defaults when no args provided", () => {
    const flags = parseComplexityFlags([]);
    expect(flags.minScore).toBe(0);
    expect(flags.grade).toBeNull();
    expect(flags.json).toBe(false);
  });

  it("parses --dir flag", () => {
    const flags = parseComplexityFlags(["--dir", "/my/project"]);
    expect(flags.dir).toBe("/my/project");
  });

  it("parses --min-score flag", () => {
    const flags = parseComplexityFlags(["--min-score", "5"]);
    expect(flags.minScore).toBe(5);
  });

  it("parses --grade flag and uppercases it", () => {
    const flags = parseComplexityFlags(["--grade", "b"]);
    expect(flags.grade).toBe("B");
  });

  it("parses --json flag", () => {
    const flags = parseComplexityFlags(["--json"]);
    expect(flags.json).toBe(true);
  });

  it("parses combined flags", () => {
    const flags = parseComplexityFlags([
      "--dir",
      "/app",
      "--min-score",
      "3",
      "--grade",
      "C",
      "--json",
    ]);
    expect(flags.dir).toBe("/app");
    expect(flags.minScore).toBe(3);
    expect(flags.grade).toBe("C");
    expect(flags.json).toBe(true);
  });
});
