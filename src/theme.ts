import { defineConfig, createSystem } from "@chakra-ui/react";

// Custom Chakra v3 system definition.
//
// NOTE: this is currently unused — `ChakraProvider.tsx` mounts Chakra's
// `defaultSystem`. It's kept as a ready-made starting point for theming work;
// to activate it, import this default export and pass it to <ChakraProvider>.
const config = defineConfig({
	// Where the generated CSS variables are applied.
	cssVarsRoot: ":where(:root, :host)",

	// Global styles.
	globalCss: {
		"html, body": {
			margin: 0,
			padding: 0,
			boxSizing: "border-box",
			backgroundColor: "var(--chakra-colors-background)",
			color: "var(--chakra-colors-text)",
		},
	},

	theme: {
		// Breakpoints for responsive design.
		breakpoints: {
			sm: "320px",
			md: "768px",
			lg: "960px",
			xl: "1200px",
		},

		// Raw color tokens for light and dark palettes.
		tokens: {
			colors: {
				light: {
					background: { value: "#f0f0f0" },
					text: { value: "#333333" },
					primary: { value: "#6200ea" }, // Purple
					secondary: { value: "#03dac6" }, // Teal
				},
				dark: {
					background: { value: "#121212" },
					text: { value: "#e0e0e0" },
					primary: { value: "#bb86fc" }, // Light purple
					secondary: { value: "#03dac6" }, // Teal
				},
			},
		},

		// Semantic tokens — resolve to the light value by default and the
		// dark value under the `_dark` condition.
		semanticTokens: {
			colors: {
				danger: { value: "{colors.red.500}" },
				background: {
					value: {
						base: "{colors.light.background}",
						_dark: "{colors.dark.background}",
					},
				},
				text: {
					value: {
						base: "{colors.light.text}",
						_dark: "{colors.dark.text}",
					},
				},
				primary: {
					value: {
						base: "{colors.light.primary}",
						_dark: "{colors.dark.primary}",
					},
				},
				secondary: {
					value: {
						base: "{colors.light.secondary}",
						_dark: "{colors.dark.secondary}",
					},
				},
			},
		},
	},
});

export default createSystem(config);
