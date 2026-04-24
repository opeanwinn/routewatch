import { describe, it, expect } from "vitest";
import { parseDepFlags } from "./route-deps-cli";

describe("parseDepFlags", () => {
  it("defaults to app dir", () => {
    const flags = parseDepFlags([]);
    expect(flags.dir).toBe("app");
    expect(flags.json).toBe(false);
    expect(flags.orphansOnly).toBe(false);
    expect(flags.sharedOnly).toBe(false);
  });

  it("parses --dir flag", () => {
    const flags = parseDepFlags(["--dir", "src/app"]);
    expect(flags.dir).toBe("src/app");
  });

  it("parses -d short flag", () => {
    const flags = parseDepFlags(["-d", "my-app"]);
    expect(flags.dir).toBe("my-app");
  });

  it("parses --json flag", () => {
    const flags = parseDepFlags(["--json"]);
    expect(flags.json).toBe(true);
  });

  it("parses --orphans flag", () => {
    const flags = parseDepFlags(["--orphans"]);
    expect(flags.orphansOnly).toBe(true);
  });

  it("parses --shared flag", () => {
    const flags = parseDepFlags(["--shared"]);
    expect(flags.sharedOnly).toBe(true);
  });

  it("uses positional arg as dir", () => {
    const flags = parseDepFlags(["custom-app"]);
    expect(flags.dir).toBe("custom-app");
  });

  it("combines multiple flags", () => {
    const flags = parseDepFlags(["--dir", "src/app", "--json", "--orphans"]);
    expect(flags.dir).toBe("src/app");
    expect(flags.json).toBe(true);
    expect(flags.orphansOnly).toBe(true);
  });
});
