import { describe, it, expect } from "vitest";
import { parseHighlightFlags, runHighlightCli, highlightHelpText } from "./highlight-cli";
import { stripAnsi } from "./highlight";

describe("parseHighlightFlags", () => {
  it("parses --query flag", () => {
    const flags = parseHighlightFlags(["--query", "admin"]);
    expect(flags.query).toBe("admin");
  });

  it("parses -q shorthand", () => {
    const flags = parseHighlightFlags(["-q", "api"]);
    expect(flags.query).toBe("api");
  });

  it("parses --diff flag", () => {
    const flags = parseHighlightFlags(["--diff"]);
    expect(flags.diff).toBe(true);
  });

  it("parses --no-color flag", () => {
    const flags = parseHighlightFlags(["--no-color"]);
    expect(flags.noColor).toBe(true);
  });

  it("returns empty flags for no args", () => {
    const flags = parseHighlightFlags([]);
    expect(flags).toEqual({});
  });
});

describe("runHighlightCli", () => {
  const lines = ["/home", "+ /new", "- /old", "/about"];

  it("returns lines unchanged when noColor", () => {
    const result = runHighlightCli(lines, { noColor: true });
    expect(result).toEqual(lines);
  });

  it("highlights diff lines when diff flag set", () => {
    const result = runHighlightCli(lines, { diff: true });
    expect(result[1]).toContain("\x1b[32m");
    expect(result[2]).toContain("\x1b[31m");
    expect(result[0]).toBe("/home");
  });

  it("highlights query matches", () => {
    const result = runHighlightCli(["/about", "/home"], { query: "about" });
    expect(stripAnsi(result[0])).toBe("/about");
    expect(result[0]).toContain("\x1b[");
    expect(result[1]).toBe("/home");
  });

  it("returns lines unchanged with no flags", () => {
    const result = runHighlightCli(lines, {});
    expect(result).toEqual(lines);
  });
});

describe("highlightHelpText", () => {
  it("contains usage info", () => {
    expect(stripAnsi(highlightHelpText)).toContain("highlight");
    expect(highlightHelpText).toContain("--query");
    expect(highlightHelpText).toContain("--diff");
  });
});
