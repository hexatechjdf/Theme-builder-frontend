import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/*
 * Centralised design system for Theme Builder — "Modern Indigo" direction.
 *
 * One source of truth for the brand. `brand` is a full indigo colour scale
 * plus the semantic tokens Chakra's recipes consume, so `colorPalette="brand"`,
 * `bg="brand.600"`, `color="brand.700"` etc. all work app-wide. Typography is
 * Inter (loaded in index.html). This only ADDS to Chakra's defaults — the
 * gray/red/green scales are untouched.
 */

const INTER =
	"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const config = defineConfig({
	theme: {
		tokens: {
			fonts: {
				heading: { value: INTER },
				body: { value: INTER },
			},
			colors: {
				// Indigo scale — accent of the app.
				brand: {
					50: { value: "#eef2ff" },
					100: { value: "#e0e7ff" },
					200: { value: "#c7d2fe" },
					300: { value: "#a5b4fc" },
					400: { value: "#818cf8" },
					500: { value: "#6366f1" },
					600: { value: "#4f46e5" },
					700: { value: "#4338ca" },
					800: { value: "#3730a3" },
					900: { value: "#312e81" },
				},
				// Cool neutral ink/surface scale for text, borders, surfaces.
				ink: {
					50: { value: "#f8fafc" },
					100: { value: "#f1f5f9" },
					200: { value: "#e2e8f0" },
					300: { value: "#cbd5e1" },
					400: { value: "#94a3b8" },
					500: { value: "#64748b" },
					600: { value: "#475569" },
					700: { value: "#334155" },
					800: { value: "#1e293b" },
					900: { value: "#0f172a" },
				},
			},
		},
		semanticTokens: {
			colors: {
				brand: {
					solid: { value: "{colors.brand.600}" },
					contrast: { value: "white" },
					fg: { value: "{colors.brand.700}" },
					muted: { value: "{colors.brand.100}" },
					subtle: { value: "{colors.brand.50}" },
					emphasized: { value: "{colors.brand.700}" },
					focusRing: { value: "{colors.brand.500}" },
				},
			},
		},
	},
	globalCss: {
		"html, body": {
			background: "#e2e4ec",
			color: "#0f172a",
			fontFamily: INTER,
			// The app never scrolls horizontally — content scrolls inside its
			// own container. `clip` kills any spurious horizontal scroll (e.g.
			// a portaled popover momentarily overflowing the viewport edge on
			// small screens) WITHOUT creating a scroll container (so it can't
			// break the sticky navbar, unlike overflow:hidden).
			overflowX: "clip",
		},
		// Indigo-tinted text selection.
		"::selection": {
			background: "rgba(79, 70, 229, 0.18)",
		},
		// Calm, unobtrusive scrollbars.
		"::-webkit-scrollbar": {
			width: "10px",
			height: "10px",
		},
		"::-webkit-scrollbar-thumb": {
			background: "rgba(15, 23, 42, 0.16)",
			borderRadius: "8px",
		},
		"::-webkit-scrollbar-thumb:hover": {
			background: "rgba(15, 23, 42, 0.28)",
		},
	},
});

export const system = createSystem(defaultConfig, config);

/*
 * Design constants for places where a literal value is clearer than a token
 * (gradients, brand-tinted shadows, the app canvas). One source of truth for
 * the look even outside the token system.
 */
export const brand = {
	/** Core brand indigo (indigo-600). */
	primary: "#4f46e5",
	primaryHover: "#4338ca",
	primaryActive: "#3730a3",
	/** Hero gradient used on auth screens and accent surfaces. */
	gradient: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
	/** Brighter accent gradient for icon chips and decorative fills. */
	gradientSoft: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
	/** Elevation shadow for primary actions. */
	shadow: "0 6px 16px -4px rgba(79, 70, 229, 0.40)",
	shadowHover: "0 10px 24px -6px rgba(79, 70, 229, 0.48)",
	/** Card elevation for the light workspace — strong enough to clearly
	 *  lift white panels off the grey canvas. */
	cardShadow:
		"0 2px 4px rgba(16, 24, 40, 0.06), 0 14px 30px -10px rgba(16, 24, 40, 0.20)",
	cardShadowHover:
		"0 2px 6px rgba(16, 24, 40, 0.08), 0 18px 36px -12px rgba(16, 24, 40, 0.24)",
	/** Elevation for field tiles inside a card — lifts each field tile so it
	 *  reads as a distinct, obvious control on the card body. */
	tileShadow:
		"0 1px 2px rgba(16, 24, 40, 0.06), 0 4px 10px -3px rgba(16, 24, 40, 0.10)",
	/** Light grey app canvas — makes white cards read as distinct surfaces. */
	canvas: "#e2e4ec",
	/** Hairline border colour for surfaces. */
	border: "#e6e8ee",
} as const;
