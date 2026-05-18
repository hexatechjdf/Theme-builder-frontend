export type FieldType = "color" | "spacing" | "number" | "text" | "select" | "fonts" | "url";

// Color value format hint sent by the backend.
//   • rgb / hex / hsl — solid colours, normalised to that format on save.
//   • filter          — picker output is a CSS filter chain (tint
//                       generator: hex → `brightness(0) ... invert(...)`).
//   • gradient        — picker output is a complete CSS gradient
//                       expression (`linear-gradient(...)`, etc.); the
//                       react-best-gradient-color-picker library auto-
//                       detects gradient mode from the initial value, so
//                       we just pass values through verbatim.
export type ColorFormat = "rgb" | "hex" | "hsl" | "filter" | "gradient";

// When the backend declares a field's value is a CSS expression (e.g. a
// `var(--other-token)` reference, a `linear-gradient(...)` literal, etc.)
// instead of a plain color/spacing/text value. We render these as a text
// input regardless of declared `type` and skip color normalisation on save
// — the value is already a complete CSS expression and goes through as-is.
export type FieldValueMode = "cssVar";

// Spacing semantics:
//  - "single": one value, no concept of sides (e.g. font-size)
//  - "full":   one value applied to all 4 sides server-side (e.g. "5px")
//  - "custom": four values stored as one comma-separated string ("top,right,bottom,left")
export type SpacingVariant = "single" | "full" | "custom";

export interface SchemaSelectOption {
	label: string;
	value: string;
}

interface SchemaFieldBase {
	id: string;
	label: string;
	key: string; // storage / save-payload key (CSS variable name)
	defaultValue?: string;
	value?: string;
	// Admin can toggle a field off without removing it from the schema.
	// Treat missing as enabled (back-compat with schemas that don't ship it).
	// Save payload includes ALL fields regardless — disabled ones are just
	// hidden in the UI.
	enabled?: boolean;
	// Optional escape hatch — when the field's value is a CSS expression
	// (var(...), gradient, etc.) rather than a typed primitive. Renders as a
	// text input; saved verbatim with no normalisation.
	valueMode?: FieldValueMode;
	// Backend-declared link target. Either a single CSS variable key
	// ("--moreDark-bg-color") or a full CSS expression containing one or
	// more `var(--key)` references. When present, the field is considered
	// "linkable" — the propagation popup at Apply Changes time will list
	// it under each parent variable it depends on. Detection is purely
	// from this field; we don't loosely match on colour equality.
	baseRoot?: string;
}

export type SchemaField =
	| (SchemaFieldBase & { type: "color"; format?: ColorFormat })
	| (SchemaFieldBase & { type: "spacing"; variant?: SpacingVariant })
	| (SchemaFieldBase & { type: "number" })
	| (SchemaFieldBase & { type: "text" })
	| (SchemaFieldBase & { type: "select"; options: SchemaSelectOption[] })
	// `fonts` is a select-like field whose options come from GET /fonts-list
	// at render time, not from the schema. The stored value is the font id
	// (matches the shape from useFontList — { value: <id>, label: <name> }).
	| (SchemaFieldBase & { type: "fonts" })
	// `url` is a text-input that, on save, wraps the value as `url("...")`
	// so the backend stores a complete CSS function expression that can
	// drop straight into `background-image: var(--logo-image)` etc.
	| (SchemaFieldBase & { type: "url" });

export interface SchemaSection {
	id: string;
	title: string;
	fields: SchemaField[];
}

export const themeSchema: SchemaSection[] = [
	{
		id: "section-base",
		title: "Base Style",
		fields: [
			{
				id: "field-primary-color",
				key: "--jdf-primary-color",
				label: "Primary Color",
				type: "color",
				format: "hex",
				defaultValue: "#735DFF",
			},
			{
				id: "field-secondary-color",
				key: "--jdf-secondary-color",
				label: "Secondary Color",
				type: "color",
				format: "rgb",
				defaultValue: "rgb(31, 41, 55)",
			},
			{
				id: "field-background-color",
				key: "--jdf-background-color",
				label: "Background Color",
				type: "color",
				format: "hex",
				defaultValue: "#ffffff",
			},
			{
				id: "field-border-radius",
				key: "--jdf-border-radius",
				label: "Border Radius",
				type: "spacing",
				variant: "full",
				defaultValue: "8px",
			},
			{
				id: "field-padding",
				key: "--jdf-padding",
				label: "Padding",
				type: "spacing",
				variant: "custom",
				defaultValue: "10px,20px,10px,15px",
			},
			{
				id: "field-margin",
				key: "--jdf-margin",
				label: "Margin",
				type: "spacing",
				variant: "custom",
				defaultValue: "0px,0px,0px,0px",
			},
			{
				id: "field-font-size",
				key: "--jdf-font-size",
				label: "Font Size",
				type: "number",
				defaultValue: "14",
			},
			{
				id: "field-font-family",
				key: "--jdf-font-family",
				label: "Font Family",
				type: "select",
				defaultValue: "Inter",
				options: [
					{ label: "Inter", value: "Inter" },
					{ label: "Roboto", value: "Roboto" },
					{ label: "Open Sans", value: "Open Sans" },
				],
			},
		],
	},
	{
		id: "section-sidebar",
		title: "Sidebar",
		fields: [
			{
				id: "field-sidebar-bg",
				key: "--jdf-sidebar-bg",
				label: "Sidebar Background",
				type: "color",
				format: "hex",
				defaultValue: "#735DFF",
			},
			{
				id: "field-sidebar-text",
				key: "--jdf-sidebar-text",
				label: "Sidebar Text Color",
				type: "color",
				format: "hex",
				defaultValue: "#ffffff",
			},
			{
				id: "field-sidebar-icon-filter",
				key: "--jdf-sidebar-icon-filter",
				label: "Sidebar Icon Filter",
				type: "text",
				defaultValue: "",
			},
		],
	},
	{
		id: "section-header",
		title: "Header",
		fields: [
			{
				id: "field-header-bg",
				key: "--jdf-header-bg",
				label: "Header Background",
				type: "color",
				format: "hex",
				defaultValue: "#735DFF",
			},
			{
				id: "field-header-text",
				key: "--jdf-header-text",
				label: "Header Text Color",
				type: "color",
				format: "hex",
				defaultValue: "#ffffff",
			},
			{
				id: "field-header-padding",
				key: "--jdf-header-padding",
				label: "Header Padding",
				type: "spacing",
				variant: "full",
				defaultValue: "12px",
			},
		],
	},
];
