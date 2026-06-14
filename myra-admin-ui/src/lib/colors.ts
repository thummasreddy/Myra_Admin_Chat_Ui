export const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6})$/;
export const DEFAULT_BRAND_COLOR = "#2563EB";

export function normalizeHexColor(value?: string | null, fallback = DEFAULT_BRAND_COLOR) {
  const color = typeof value === "string" ? value.trim() : "";
  return HEX_COLOR_REGEX.test(color) ? color.toUpperCase() : fallback;
}
