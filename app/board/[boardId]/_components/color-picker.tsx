"use client";

import { useState } from "react";
import { colorToBackgroundCss, GRADIENT_PRESETS, hexToRgb, rgbToHex } from "@/lib/utils";
import { Color } from "@/types/canvas";
import { Pipette, Sparkles } from "lucide-react";

interface ColorPickerProps {
  onChange: (color: Color) => void;
  currentColor?: Color;
}

const SOLID_COLORS: Color[] = [
  { r: 243, g: 82, b: 35 },   // Coral Red
  { r: 252, g: 142, b: 42 },  // Orange
  { r: 255, g: 193, b: 7 },   // Amber
  { r: 255, g: 249, b: 177 }, // Pastel Yellow
  { r: 68, g: 202, b: 99 },   // Green
  { r: 0, g: 188, b: 212 },   // Cyan
  { r: 39, g: 142, b: 237 },  // Sky Blue
  { r: 155, g: 105, b: 245 }, // Purple
  { r: 255, g: 105, b: 180 }, // Pink
  { r: 121, g: 85, b: 72 },   // Brown
  { r: 0, g: 0, b: 0 },       // Black
  { r: 255, g: 255, b: 255 }, // White
];

export const ColorPicker = ({ onChange, currentColor }: ColorPickerProps) => {
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">("solid");
  const [customHex, setCustomHex] = useState(
    currentColor ? rgbToHex(currentColor) : "#2563eb"
  );

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    onChange(hexToRgb(hex));
  };

  return (
    <div className="flex flex-col gap-2 max-w-[200px] pr-2 mr-2 border-r border-neutral-200">
      {/* Mode toggle */}
      <div className="flex rounded-md bg-neutral-100 p-0.5 text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("solid")}
          className={`flex-1 rounded py-0.5 text-center transition ${
            activeTab === "solid"
              ? "bg-white text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Solid
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gradient")}
          className={`flex-1 rounded py-0.5 text-center flex items-center justify-center gap-1 transition ${
            activeTab === "gradient"
              ? "bg-white text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Sparkles className="h-3 w-3 text-amber-500" /> Gradient
        </button>
      </div>

      {/* Solid Palette */}
      {activeTab === "solid" && (
        <>
          <div className="grid grid-cols-6 gap-1.5">
            {SOLID_COLORS.map((color, idx) => (
              <button
                key={idx}
                type="button"
                className="group relative h-6 w-6 rounded-md border border-neutral-300 transition hover:scale-110 active:scale-95 shadow-xs"
                style={{ background: colorToBackgroundCss(color) }}
                onClick={() => onChange(color)}
                aria-label={`Color rgb(${color.r},${color.g},${color.b})`}
              />
            ))}
          </div>

          {/* Custom Hex Color input */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
            <div className="relative flex items-center">
              <input
                type="color"
                value={customHex}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-neutral-200 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                aria-label="Custom color picker"
              />
              <Pipette className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 text-white mix-blend-difference" />
            </div>
            <input
              type="text"
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="h-6 w-20 rounded border border-neutral-200 px-1.5 font-mono text-[11px] uppercase text-neutral-700 outline-none focus:border-sky-500"
              placeholder="#000000"
              maxLength={7}
            />
          </div>
        </>
      )}

      {/* Gradient Palette */}
      {activeTab === "gradient" && (
        <div className="grid grid-cols-3 gap-1.5">
          {GRADIENT_PRESETS.map((grad) => (
            <button
              key={grad.id}
              type="button"
              className="group relative flex h-7 items-center justify-center rounded-md border border-neutral-200 text-[10px] font-medium text-white shadow-xs transition hover:scale-105 active:scale-95"
              style={{ background: grad.css }}
              onClick={() =>
                onChange({
                  r: grad.r,
                  g: grad.g,
                  b: grad.b,
                  gradient: grad.id,
                })
              }
              title={grad.name}
              aria-label={`Gradient ${grad.name}`}
            >
              <span className="drop-shadow-sm truncate px-1">{grad.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};