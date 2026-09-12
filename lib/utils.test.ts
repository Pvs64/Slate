import { describe, expect, it } from "vitest";
import {
  colorToCss,
  getContrastingTextColor,
  hexToRgb,
  mergeMissingLayerIds,
  resizeBounds,
  rgbToHex,
} from "./utils";
import { getTemplateLayers } from "./templates";
import { Side } from "@/types/canvas";

describe("canvas utilities", () => {
  it("resizes bounds from the right and bottom edges", () => {
    expect(resizeBounds({ x: 10, y: 20, width: 100, height: 80 }, Side.Right | Side.Bottom, { x: 160, y: 140 })).toEqual({
      x: 10,
      y: 20,
      width: 150,
      height: 120,
    });
  });

  it("keeps resize bounds positive when dragging past the top-left", () => {
    expect(resizeBounds({ x: 10, y: 20, width: 100, height: 80 }, Side.Left | Side.Top, { x: -20, y: -30 })).toEqual({
      x: -20,
      y: -30,
      width: 130,
      height: 130,
    });
  });

  it("chooses readable text colors for light and dark fills", () => {
    expect(getContrastingTextColor({ r: 255, g: 255, b: 255 })).toBe("black");
    expect(getContrastingTextColor({ r: 20, g: 20, b: 20 })).toBe("white");
  });

  it("merges offline layer IDs without overwriting remote order or duplicates", () => {
    expect(mergeMissingLayerIds(["local-a", "shared", "local-b"], ["remote-a", "shared"])).toEqual([
      "remote-a",
      "shared",
      "local-a",
      "local-b",
    ]);
  });

  it("converts hex to rgb and rgb to hex", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe("#00ff00");
  });

  it("supports solid and gradient colorToCss formatting", () => {
    expect(colorToCss({ r: 10, g: 20, b: 30 })).toBe("rgb(10, 20, 30)");
    expect(colorToCss({ r: 0, g: 0, b: 0, gradient: "grad-sunset" })).toBe("url(#grad-sunset)");
  });

  it("retrieves valid definitions for all 6 workflow templates", () => {
    const keys = ["system-design", "database-design", "code-review", "mind-map", "study-planner", "lecture-notes"];
    for (const key of keys) {
      const t = getTemplateLayers(key);
      expect(t).toBeDefined();
      expect(t?.layerIds.length).toBeGreaterThan(0);
      expect(Object.keys(t?.layers || {}).length).toBe(t?.layerIds.length);
    }
  });
});