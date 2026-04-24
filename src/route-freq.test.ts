import {
  buildFrequencyMap,
  buildFrequencyReport,
  formatFrequencyReport,
} from "./route-freq";
import type { HistoryEntry } from "./history";

function makeEntry(
  timestamp: string,
  paths: string[]
): HistoryEntry & { paths: string[] } {
  return { timestamp, branch: "main", nodeCount: paths.length, paths } as any;
}

describe("buildFrequencyMap", () => {
  it("counts occurrences of each path", () => {
    const entries = [
      makeEntry("2024-01-01T10:00:00Z", ["/", "/about"]),
      makeEntry("2024-01-02T10:00:00Z", ["/", "/contact"]),
      makeEntry("2024-01-03T10:00:00Z", ["/"]),
    ];
    const map = buildFrequencyMap(entries);
    expect(map.get("/")?.count).toBe(3);
    expect(map.get("/about")?.count).toBe(1);
    expect(map.get("/contact")?.count).toBe(1);
  });

  it("tracks firstSeen and lastSeen correctly", () => {
    const entries = [
      makeEntry("2024-01-01T00:00:00Z", ["/dashboard"]),
      makeEntry("2024-01-05T00:00:00Z", ["/dashboard"]),
    ];
    const map = buildFrequencyMap(entries);
    const rec = map.get("/dashboard")!;
    expect(rec.firstSeen).toBe("2024-01-01T00:00:00Z");
    expect(rec.lastSeen).toBe("2024-01-05T00:00:00Z");
  });

  it("returns empty map for no entries", () => {
    expect(buildFrequencyMap([]).size).toBe(0);
  });
});

describe("buildFrequencyReport", () => {
  it("returns topN routes sorted by count", () => {
    const entries = [
      makeEntry("2024-01-01T00:00:00Z", ["/a", "/b", "/c"]),
      makeEntry("2024-01-02T00:00:00Z", ["/a", "/b"]),
      makeEntry("2024-01-03T00:00:00Z", ["/a"]),
    ];
    const report = buildFrequencyReport(entries, 2);
    expect(report.topRoutes).toHaveLength(2);
    expect(report.topRoutes[0].path).toBe("/a");
    expect(report.topRoutes[0].count).toBe(3);
    expect(report.topRoutes[1].path).toBe("/b");
    expect(report.totalScans).toBe(3);
    expect(report.uniquePaths).toBe(3);
  });

  it("handles empty history", () => {
    const report = buildFrequencyReport([]);
    expect(report.topRoutes).toHaveLength(0);
    expect(report.totalScans).toBe(0);
    expect(report.uniquePaths).toBe(0);
  });
});

describe("formatFrequencyReport", () => {
  it("includes header and route rows", () => {
    const entries = [makeEntry("2024-06-01T12:00:00Z", ["/", "/blog"])];
    const report = buildFrequencyReport(entries);
    const output = formatFrequencyReport(report);
    expect(output).toContain("Route Frequency Report");
    expect(output).toContain("/");
    expect(output).toContain("/blog");
  });

  it("shows no data message when empty", () => {
    const report = buildFrequencyReport([]);
    const output = formatFrequencyReport(report);
    expect(output).toContain("(no data)");
  });
});
