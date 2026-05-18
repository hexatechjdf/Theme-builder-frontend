import type { SchemaSection } from "./themeSchema";
import { themeNames } from "./dropDownMenuOptions";

// LEGACY: the Loader Animation page now builds its schema inline using
// useLoadersList() so the `animation` field's options come from the API.
// Kept as a reference for the schema shape and to allow rolling back to a
// static fallback if needed. Bare legacy keys (no `--` prefix) so the save
// payload matches the existing contract.

export const loaderAnimationSchema: SchemaSection[] = [
	{
		id: "loader-animation",
		title: "Loader Animation",
		fields: [
			{
				id: "animation-image-url",
				key: "animation-image-url",
				label: "Animation Image URL",
				type: "text",
			},
			{
				id: "animationTheme",
				key: "animationTheme",
				label: "Select a theme",
				type: "select",
				options: themeNames,
			},
			{
				id: "animation",
				key: "animation",
				label: "Select animation",
				type: "select",
				// Was: options: animations (static). Now driven by GET /loaders-list.
				options: [],
			},
		],
	},
];
