import type { SchemaSection } from "./themeSchema";

// `key` here is what gets sent to the backend in `roots`. Per the legacy
// payload contract these are bare CSS-var names (no `--jdf-` prefix).
// `id` is just a stable identifier for React keys.

export const loginThemeSchema: SchemaSection[] = [
	{
		id: "login-base",
		title: "Base Styles",
		fields: [
			{
				id: "login-card-bg-color",
				key: "login-card-bg-color",
				label: "Card Background Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-background-image-url",
				key: "login-background-image-url",
				label: "Login Background Image URL",
				type: "text",
			},
			{
				id: "login-card-margin-left",
				key: "login-card-margin-left",
				label: "Card Margin Left",
				type: "spacing",
				variant: "single",
			},
			{
				id: "login-card-margin-right",
				key: "login-card-margin-right",
				label: "Card Margin Right",
				type: "spacing",
				variant: "single",
			},
		],
	},
	{
		id: "login-header",
		title: "Login Header",
		fields: [
			{
				id: "login-top-header-bg-color",
				key: "login-top-header-bg-color",
				label: "Login Top Header Background Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-top-header-logo-image-url",
				key: "login-top-header-logo-image-url",
				label: "Top Header Logo Image URL",
				type: "text",
			},
		],
	},
	{
		id: "login-card",
		title: "Login Card",
		fields: [
			{
				id: "login-card-background-color",
				key: "login-card-background-color",
				label: "Login Card Background Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-card-heading-color",
				key: "login-card-heading-color",
				label: "Login Card Heading Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-button-bg-color",
				key: "login-button-bg-color",
				label: "Login Button Background Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-card-foot-note-color",
				key: "login-card-foot-note-color",
				label: "Login Card Foot Note Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-card-forgotpassword-termsandcondition-color",
				key: "login-card-forgotpassword-termsandcondition-color",
				label: "Forgot Password / Terms Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-input-label-text-color",
				key: "login-input-label-text-color",
				label: "Login Input Label Text Color",
				type: "color",
				format: "hex",
			},
			{
				id: "login-card-logo-image-url",
				key: "login-card-logo-image-url",
				label: "Login Card Logo Image URL",
				type: "text",
			},
			{
				id: "login-card-left-side",
				key: "login-card-left-side",
				label: "Login Card Left Margin",
				type: "spacing",
				variant: "single",
			},
			{
				id: "login-card-right-side",
				key: "login-card-right-side",
				label: "Login Card Right Margin",
				type: "spacing",
				variant: "single",
			},
		],
	},
];
