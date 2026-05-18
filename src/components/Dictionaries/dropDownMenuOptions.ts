interface OptionsObject {
	value: string;
	label: string;
}
// Static loader list — superseded by GET /loaders-list (see useLoadersList in
// services/api.ts). Kept commented for reference / quick local fallback.
// const animations: OptionsObject[] = [
// 	{ value: "fadeIn", label: "fadeIn" },
// 	{ value: "slideUp", label: "slideUp" },
// 	{ value: "bounce", label: "bounce" },
// 	{ value: "rotate", label: "rotate" },
// 	{ value: "zoomIn", label: "zoomIn" },
// 	{ value: "pulse", label: "pulse" },
// 	{ value: "swing", label: "swing" },
// 	{ value: "shake", label: "shake" },
// 	{ value: "flip", label: "flip" },
// 	{ value: "zoomOut", label: "zoomOut" },
// ];

const themeNames: OptionsObject[] = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "cyberpunk", label: "Cyberpunk" },
	{ value: "retro", label: "Retro" },
	{ value: "minimal", label: "Minimal" },
	{ value: "pastel", label: "Pastel" },
	{ value: "grayscale", label: "Grayscale" },
	{ value: "monochrome", label: "Monochrome" },
	{ value: "vintage", label: "Vintage" },
	{ value: "forest", label: "Forest" },
	{ value: "ocean", label: "Ocean" },
	{ value: "sunset", label: "Sunset" },
	{ value: "winter", label: "Winter" },
	{ value: "spring", label: "Spring" },
	{ value: "summer", label: "Summer" },
	{ value: "autumn", label: "Autumn" },
	{ value: "futuristic", label: "Futuristic" },
	{ value: "neon", label: "Neon" },
	{ value: "luxury", label: "Luxury" },
	{ value: "classic", label: "Classic" },
];

export { themeNames };
