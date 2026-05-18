import { defineConfig, createSystem, ThemeConfig } from "@chakra-ui/react";

// Define the color tokens for light and dark modes
const config: ThemeConfig = defineConfig({
	cssVarsRoot: ":where(:root, :host)", // where CSS variables will be applied
	theme: {
		colors: {
			// Light mode colors
			light: {
				background: "#f0f0f0",
				text: "#333333",
				primary: "#6200ea", // Purple for primary color
				secondary: "#03dac6", // Teal for secondary color
			},
			// Dark mode colors
			dark: {
				background: "#121212",
				text: "#e0e0e0",
				primary: "#bb86fc", // Light Purple for primary color
				secondary: "#03dac6", // Teal for secondary color
			},
		},
		semanticTokens: {
			colors: {
				// Danger token
				danger: {
					value: "{colors.red.500}",
				},
				// Background and text colors will change based on theme mode
				background: {
					default: "{colors.light.background}",
					_dark: "{colors.dark.background}",
				},
				text: {
					default: "{colors.light.text}",
					_dark: "{colors.dark.text}",
				},
				primary: {
					default: "{colors.light.primary}",
					_dark: "{colors.dark.primary}",
				},
				secondary: {
					default: "{colors.light.secondary}",
					_dark: "{colors.dark.secondary}",
				},
			},
		},
		// Breakpoints for responsive design
		breakpoints: {
			sm: "320px",
			md: "768px",
			lg: "960px",
			xl: "1200px",
		},
		// Global styles
		globalCss: {
			"html, body": {
				margin: 0,
				padding: 0,
				boxSizing: "border-box",
				backgroundColor: "var(--chakra-colors-background)", // Use background color from tokens
				color: "var(--chakra-colors-text)", // Use text color from tokens
			},
		},
	},
	// Enable dark mode support with system-based theme switching
	initialColorMode: "light", // Default to light mode
	useSystemColorMode: true, // Automatically switch to dark mode if the user prefers it
});

export default createSystem(config);
