import { describe, it, expect } from "vitest";
import { parseHotspotFlags } from "./route-hotspot-cli";

describe("parseHotspotFlags", () => {
  it("returns defaults when no args given", () => {
    const flags = parseHotspotFlags([]);
    expect(flags.dir).toBe("app");
    expect(flags.topN).toBe(5);
    expect(flags.json).toBe(false);
  });

  it("parses --dir flag", () => {
    const flags = parseHotspotFlags(["--dir", "src/app"]);
    expect(flags.dir).toBe("src/app");
  });

  it("parses -d shorthand", () => {
    const flags = parseHotspotFlags(["-d", "my-app"]);
    expect(flags.dir).toBe("my-app");
  });

  it("parses --top flag", () => {
    const flags = parseHotspotFlags(["--top", "10"]);
    expect(flags.topN).toBe(10);
  });

  it("parses -n shorthand", () => {
    const flags = parseHotspotFlags(["-n", "3"]);
    expect(flags.topN).toBe(3);
  });

  it("ignores invalid --top value", () => {
    const flags = parseHotspotFlags(["--top", "abc"]);
    expect(flags.topN).toBe(5);
  });

  it("parses --json flag", () => {
    const flags = parseHotspotFlags(["--json"]);
    expect(flags.json).toBe(true);
  });

  it("parses combined flags", () => {
    const flags = parseHotspotFlags(["-d", "app", "-n", "7", "--json"]);
    expect(flags.dir).toBe("app");
    expect(flags.topN).toBe(7);
    expect(flags.json).toBe(true);
  });
});
