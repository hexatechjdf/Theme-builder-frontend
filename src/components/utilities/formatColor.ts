// Color format handling.
//
// The schema's `format` hint declares how a color value should be expressed
// on the wire. Per backend convention, the value stored & sent is the RAW
// tuple — no `rgb(...)` / `hsl(...)` wrapper. The admin-authored CSS supplies
// the wrapper:
//
//     :root { --primary-color: 70, 95, 215; }
//     .btn  { color: rgb(var(--primary-color)); }
//
// So this module is the bridge between the picker (which speaks full CSS
// colors) and storage / the wire (raw tuples).

import CssFilterConverter from "css-filter-converter";
import type { ColorFormat } from "../Dictionaries/themeSchema";

// Use the browser to parse any CSS color string into rgba components.
// Returns null if the string isn't a recognized color (e.g. a filter chain).
const parseRgbaFromCss = (
	css: string
): [number, number, number, number] | null => {
	if (!css) return null;
	const probe = new Option().style;
	probe.color = "";
	probe.color = css;
	if (!probe.color) return null;
	// `probe.color` is always normalized to "rgb(r, g, b)" or "rgba(...)".
	const m = probe.color.match(/rgba?\(([^)]+)\)/i);
	if (!m) return null;
	const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
	if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
	return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};

const toHexString = (r: number, g: number, b: number): string => {
	const h = (n: number) =>
		Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
	return `#${h(r)}${h(g)}${h(b)}`;
};

// Detect a CSS filter chain (e.g. "brightness(0) saturate(100%) invert(50%)").
const looksLikeFilterChain = (s: string): boolean =>
	/\b(brightness|contrast|sepia|saturate|hue-rotate|invert)\(/i.test(s);

// Wrap a raw stored value with the format wrapper so it can be parsed by the
// color picker (which expects full CSS color strings).
//
//   "70, 95, 215"    + "rgb" → "rgb(70, 95, 215)"
//   "228, 67%, 56%"  + "hsl" → "hsl(228, 67%, 56%)"
//   "#465FD7"        + "hex" → "#465FD7"
//
// Already-wrapped values (legacy storage that included the wrapper, or full
// CSS strings) are returned as-is so old saved data keeps working.
export const wrapWithFormat = (
	raw: string | undefined | null,
	format?: ColorFormat
): string => {
	if (!raw) return "";
	const trimmed = String(raw).trim();
	// Gradients are already complete CSS expressions — never touch them.
	if (format === "gradient") return trimmed;
	// Already a complete CSS color string — pass through.
	if (
		trimmed.startsWith("rgb") ||
		trimmed.startsWith("hsl") ||
		trimmed.startsWith("#") ||
		trimmed.startsWith("var(") ||
		trimmed.startsWith("linear-gradient") ||
		trimmed.startsWith("radial-gradient") ||
		trimmed.startsWith("conic-gradient")
	) {
		return trimmed;
	}
	// Bare 6-or-8 char hex without `#` — prepend it.
	if (/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(trimmed)) {
		return `#${trimmed}`;
	}
	// Raw tuple — looks like "H, S%, L%" or "R, G, B" etc.
	const tupleParts = trimmed.split(/[,\s]+/).filter(Boolean);
	const looksLikeTuple = tupleParts.length >= 3 && tupleParts.length <= 4;
	if (looksLikeTuple) {
		// Honor the format prop if it tells us how to wrap.
		if (format === "rgb") return `rgb(${trimmed})`;
		if (format === "hsl") return `hsl(${trimmed})`;
		// `format` is "hex" / "filter" / undefined but the value is clearly a
		// tuple — infer from content so we still produce a parseable CSS
		// string instead of crashing the picker. Presence of "%" ⇒ hsl;
		// all-numeric (or with a leading angle unit) ⇒ rgb.
		if (trimmed.includes("%")) return `hsl(${trimmed})`;
		return `rgb(${trimmed})`;
	}
	// `filter` is a complete CSS filter expression (e.g. "brightness(50%) ...")
	// — pass through as-is so the consumer can apply it verbatim.
	return trimmed;
};

// Strip the format wrapper to obtain the raw tuple for storage / wire.
//
//   "rgb(70, 95, 215)"      + "rgb" → "70, 95, 215"
//   "rgba(70, 95, 215, 0.5)"+ "rgb" → "70, 95, 215, 0.5"
//   "hsl(228, 67%, 56%)"    + "hsl" → "228, 67%, 56%"
//   "#465FD7"               + "hex" → "#465FD7"
export const unwrapToRaw = (
	css: string | undefined | null,
	format?: ColorFormat
): string => {
	if (!css) return "";
	const trimmed = String(css).trim();
	if (format === "rgb") {
		const m = trimmed.match(/^rgba?\(([^)]+)\)$/i);
		return m ? m[1].trim() : trimmed;
	}
	if (format === "hsl") {
		const m = trimmed.match(/^hsla?\(([^)]+)\)$/i);
		return m ? m[1].trim() : trimmed;
	}
	// hex / filter / undefined — keep as-is.
	return trimmed;
};

// Convert an RGB(A) tuple from the picker into an HSL-formatted string
// suitable for storage when the schema's format is "hsl".
//   rgbToHslString(70, 95, 215)         → "228, 67%, 56%"
//   rgbToHslString(70, 95, 215, 0.5)    → "228, 67%, 56%, 0.5"
export const rgbToHslString = (
	r: number,
	g: number,
	b: number,
	a?: number
): string => {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	let h = 0;
	let s = 0;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
		else if (max === gn) h = (bn - rn) / d + 2;
		else h = (rn - gn) / d + 4;
		h *= 60;
	}
	const H = Math.round(h);
	const S = Math.round(s * 100);
	const L = Math.round(l * 100);
	if (a !== undefined && a < 1) {
		return `${H}, ${S}%, ${L}%, ${a}`;
	}
	return `${H}, ${S}%, ${L}%`;
};

// Build a raw RGB tuple from the picker's rgba array.
//   rgbToRgbString(70, 95, 215)       → "70, 95, 215"
//   rgbToRgbString(70, 95, 215, 0.5)  → "70, 95, 215, 0.5"
export const rgbToRgbString = (
	r: number,
	g: number,
	b: number,
	a?: number
): string => {
	const parts: (number | string)[] = [Math.round(r), Math.round(g), Math.round(b)];
	if (a !== undefined && a < 1) parts.push(a);
	return parts.join(", ");
};

// Convert any stored value into the format the schema declares. Used both
// to seed defaults from the schema's defaultValue (which can be in any
// format, typically rgb) AND at save time to ensure every payload entry
// matches the declared format — even fields the user never touched.
//
//   normalizeToFormat("rgb(70, 95, 215)", "hex")    → "#465fd7"
//   normalizeToFormat("rgb(102, 112, 133)", "hsl")  → "220, 13%, 46%"
//   normalizeToFormat("rgb(29, 41, 57)", "filter")  → "brightness(0) saturate(100%) ..."
//   normalizeToFormat("228, 5%, 56%", "hsl")        → "228, 5%, 56%"   (already in format)
//   normalizeToFormat("<filter chain>", "filter")   → same chain (re-converting would lose info)
export const normalizeToFormat = (
	value: string | undefined | null,
	format?: ColorFormat
): string => {
	if (!value) return "";
	const trimmed = String(value).trim();

	// Gradients (and anything that already looks like one) round-trip as-is.
	// The picker library outputs full `linear-gradient(...)` strings and the
	// backend stores them verbatim — no parsing to rgba.
	if (
		format === "gradient" ||
		/^(linear|radial|conic)-gradient\(/i.test(trimmed)
	) {
		return trimmed;
	}

	if (format === "filter") {
		// Already a filter chain — keep it (can't reverse to colour & back).
		if (looksLikeFilterChain(trimmed)) return trimmed;
		// Anything else — convert through hex to a filter chain.
		const cssForBrowser = wrapWithFormat(trimmed, format);
		const rgba = parseRgbaFromCss(cssForBrowser);
		if (!rgba) return trimmed;
		const [r, g, b] = rgba;
		try {
			const chain = CssFilterConverter.hexToFilter(toHexString(r, g, b)).color;
			if (chain) return chain;
		} catch {
			/* fall through */
		}
		return toHexString(r, g, b);
	}

	// For rgb/hsl/hex, parse through the browser then re-emit in the target
	// format. Wrap raw tuples first so the browser can parse them.
	const cssForBrowser = wrapWithFormat(trimmed, format);
	const rgba = parseRgbaFromCss(cssForBrowser);
	if (!rgba) return trimmed; // unparseable — leave as-is rather than crash

	const [r, g, b, a] = rgba;
	if (format === "rgb") return rgbToRgbString(r, g, b, a);
	if (format === "hsl") return rgbToHslString(r, g, b, a);
	if (format === "hex") return toHexString(r, g, b);

	// Unknown format — return whatever the browser parsed.
	return cssForBrowser;
};
