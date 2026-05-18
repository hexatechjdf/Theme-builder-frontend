import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { customStyleColorValuesAtom } from "../store/customizationValueStore.ts";
import { Button } from "../ui/button";
import {
	DrawerActionTrigger,
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
} from "../ui/drawer";
import ColorPicker, { useColorPicker } from "react-best-gradient-color-picker";
import { Box, Text, Textarea } from "@chakra-ui/react";
import { useDebouncedCallback } from "use-debounce";
import debounce from "lodash/debounce";
import store from "store2";
import CssFilterConverter from "css-filter-converter";
import type { ColorFormat } from "../Dictionaries/themeSchema";
import {
	wrapWithFormat,
	unwrapToRaw,
	rgbToRgbString,
	rgbToHslString,
} from "../utilities/formatColor";
import { writeRoot, useRootsVersion } from "../utilities/rootsLive";

// `react-best-gradient-color-picker` parses the value string with its own
// CSS parser (gradient-parser) that throws on:
//   • `var(--…)` references inside stops
//   • the `!important` qualifier
//   • stray semicolons
// Detect those up front so we don't even mount the picker — we'll render a
// textarea + live preview instead, which is the only viable UX for a
// gradient whose stops are CSS-variable references anyway (the user can't
// drag stops that resolve at render time).
const isPickerSafeGradient = (value: string | undefined | null): boolean => {
	if (!value) return true;
	const v = String(value);
	if (!/^(linear|radial|conic)-gradient\(/i.test(v)) return true;
	if (/\bvar\s*\(/i.test(v)) return false;
	if (/!\s*important/i.test(v)) return false;
	return true;
};

// Strip CSS qualifiers that are invalid inside inline `style={{ background }}`
// values (the style attribute doesn't accept `!important`, and a trailing
// `;` terminates the property). Used for the live-preview chip only — the
// stored value keeps the original suffix so save round-trips intact.
const sanitizeForInlineStyle = (value: string | undefined | null): string => {
	if (!value) return "";
	return String(value)
		.replace(/\s*!\s*important\s*;?\s*$/i, "")
		.replace(/;\s*$/, "")
		.trim();
};

interface ColorDrawerProps {
	id: string; // Unique ID for state
	format?: ColorFormat; // backend-declared format ("rgb" | "hex" | "hsl"); save value preserves this
}

// Shared across every color field: persists the last N colors the user committed
// so they can be reused with one click from the swatch row.
const RECENT_COLORS_KEY = "recentColors";
const RECENT_COLORS_LIMIT = 10;

const readRecentColors = (): string[] => {
	const raw = store(RECENT_COLORS_KEY);
	return Array.isArray(raw) ? raw.filter((c) => typeof c === "string") : [];
};

const pushRecentColor = (color: string) => {
	if (!color) return;
	const list = readRecentColors();
	const next = [color, ...list.filter((c) => c !== color)].slice(
		0,
		RECENT_COLORS_LIMIT
	);
	store(RECENT_COLORS_KEY, next);
};

interface DrawerState {
	isOpen: boolean;
	color: string;
	original: string;
	pre: string;
	current: boolean;
	isLoaded: boolean;
}

interface InnerProps {
	id: string;
	drawerState: DrawerState;
	setDrawerState: (
		updater: (prev: DrawerState) => DrawerState
	) => void;
	format?: ColorFormat;
}

// All the heavy color-picker plumbing lives here so it only mounts when the
// drawer is actually open. Mounting `react-best-gradient-color-picker` (which
// initializes a canvas + numerous internal refs) per closed swatch was the
// dominant cost of opening a tab.
// Render a textarea editor (plus a live preview chip) for gradients the
// picker library can't parse — gradients with `var(--…)` stops or
// `!important` suffixes. The stored value round-trips verbatim through
// store2, so save still sends the original CSS expression.
const GradientTextEditor: React.FC<InnerProps> = ({ id, drawerState, setDrawerState }) => {
	const [value, setValue] = useState(drawerState.color || "");

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const next = e.target.value;
		setValue(next);
		setDrawerState((prev) => ({ ...prev, color: next }));
		writeRoot(id, next);
		const changedList = (store("changedList") as string[]) || [];
		if (!changedList.includes(id)) {
			store("changedList", [...changedList, id]);
		}
	};

	return (
		<Box w="100%" p={4}>
			<Text fontSize="xs" color="gray.500" mb={2}>
				This gradient references CSS variables or uses{" "}
				<Text as="span" fontFamily="mono">
					!important
				</Text>{" "}
				— the visual editor can't represent it, so it's editable as text.
				Live preview below.
			</Text>
			<Box
				w="100%"
				h="100px"
				borderRadius="md"
				border="1px solid"
				borderColor="gray.300"
				mb={3}
				style={{ background: sanitizeForInlineStyle(value) || "#000000" }}
			/>
			<Textarea
				value={value}
				onChange={handleChange}
				rows={6}
				fontFamily="mono"
				fontSize="xs"
				placeholder="linear-gradient(…)"
			/>
		</Box>
	);
};

// The actual gradient/colour picker. Split out into its own component so it
// can be conditionally mounted by ColorPickerInner — Rules of Hooks forbid
// an early-return BEFORE `useColorPicker` is called, but we MUST avoid
// calling that hook on a gradient string the picker library can't parse
// (it throws synchronously during the parse).
const PickerWidget: React.FC<InnerProps> = ({ id, drawerState, setDrawerState, format }) => {
	const [color, setColor] = useState(drawerState.color);
	const { valueToHex, rgbaArr } = useColorPicker(color, setColor);
	const [recentColors] = useState<string[]>(() => readRecentColors());

	// Produce a CSS color string in the format declared by the schema. This
	// is what we keep in drawerState (so the picker can re-render against
	// it) and what we strip down to a raw tuple before writing to store2.
	const toFormatString = (): string => {
		// Gradient: the picker's CURRENT value `color` IS the gradient CSS
		// string (e.g. "linear-gradient(45deg, #aaa, #bbb)"). useColorPicker's
		// `valueToHex` / `rgbaArr` aren't meaningful for gradient mode — return
		// the raw value so it round-trips intact.
		if (format === "gradient") {
			return color;
		}
		if (rgbaArr && rgbaArr.length >= 3) {
			const [r, g, b, a] = rgbaArr;
			if (format === "rgb") {
				return `rgb(${rgbToRgbString(r, g, b, a)})`;
			}
			if (format === "hsl") {
				return `hsl(${rgbToHslString(r, g, b, a)})`;
			}
		}
		// hex (default) and any unknown format: hex round-trips fine.
		return valueToHex();
	};

	const debounced = useDebouncedCallback((newColor: string) => {
		setColor(newColor);
		const changedList = store("changedList") || [];
		if (!changedList.includes(id)) {
			changedList.push(id);
			store("changedList", changedList);
		}
	}, 10);

	useEffect(() => {
		const debouncedUpdate = debounce((nextValue: string) => {
			// drawerState.color stays as the full CSS string the picker is
			// rendering (solid colour OR gradient). The storage path branches
			// per format: filter stores a chain, gradient passes through,
			// rgb/hsl/hex strip back to raw tuples / hex.
			setDrawerState((prevState) => ({
				...prevState,
				color: nextValue,
				current: prevState.pre ? true : false,
			}));

			if (format === "filter") {
				// Schema declared a CSS-filter field: convert the picked color
				// into a filter chain (brightness/contrast/sepia/...) that
				// tints a black icon to this colour. Admin's CSS consumes the
				// chain directly: `filter: var(--icon-tint);`
				try {
					const chain = CssFilterConverter.hexToFilter(valueToHex()).color;
					if (chain) {
						writeRoot(id, chain);
						return;
					}
				} catch {
					/* fall through to raw-hex storage below */
				}
				writeRoot(id, valueToHex());
				return;
			}

			if (format === "gradient") {
				// Gradient is already a complete CSS expression — admin CSS
				// uses it directly (`background: var(--bg-gradient)`). Persist
				// verbatim so the next reload re-opens the picker on the
				// exact same gradient stops.
				writeRoot(id, nextValue);
				return;
			}

			// rgb / hsl / hex (default): persist the RAW tuple. Admin-authored
			// CSS (e.g. `color: rgb(var(--primary-color))`) supplies the
			// wrapper.
			writeRoot(id, unwrapToRaw(nextValue, format));
		}, 50);

		const next = toFormatString();
		if (drawerState.color !== next) {
			debouncedUpdate(next);
		}

		return () => {
			debouncedUpdate.cancel();
		};
		// `color` (the picker's current internal value) is the dep that
		// changes for both solid AND gradient edits — `valueToHex()` alone
		// would miss gradient-stop changes.
		// eslint-disable-next-line
	}, [color]);

	return (
		<Box>
			{recentColors.length > 0 && (
				<Box mb={3}>
					<Text fontSize="xs" color="gray.500" mb={1.5}>
						Recent
					</Text>
					<Box display="flex" gap={1.5} flexWrap="wrap">
						{recentColors.map((c) => (
							<Box
								key={c}
								as="button"
								onClick={() => debounced(c)}
								w="24px"
								h="24px"
								borderRadius="4px"
								bg={c}
								border="1px solid"
								borderColor="gray.300"
								cursor="pointer"
								_hover={{ transform: "scale(1.1)" }}
								transition="transform 80ms ease"
								aria-label={`Use color ${c}`}
								title={c}
							/>
						))}
					</Box>
				</Box>
			)}
			<ColorPicker value={drawerState.color} onChange={debounced} />
		</Box>
	);
};

// Picker drawer entry-point. Decides between the visual picker and a textarea
// fallback BEFORE either component mounts so the lib's parser never runs on
// a gradient string it can't handle.
const ColorPickerInner: React.FC<InnerProps> = (props) => {
	if (
		props.format === "gradient" &&
		!isPickerSafeGradient(props.drawerState.color)
	) {
		return <GradientTextEditor {...props} />;
	}
	return <PickerWidget {...props} />;
};

const ColorDrawer: React.FC<ColorDrawerProps> = ({ id, format }) => {
	const [drawerState, setDrawerState] = useRecoilState(
		customStyleColorValuesAtom(id)
	);
	// Re-run the hydration effect below whenever ANY roots variable is
	// written via `writeRoot`. For a linked field (stored value is
	// `var(--parent)`), this is what causes the swatch to follow the
	// parent's new colour without a full reload — the effect re-reads
	// `store(--parent)` and pushes the resolved literal back into Recoil.
	const rootsVersion = useRootsVersion();

	const handleClose = () => {
		// Persist whatever color the user landed on into the shared recents list
		// so it appears in the swatch row on the next drawer open (any field).
		pushRecentColor(drawerState.color);
		setDrawerState((prevState) => ({
			...prevState,
			isOpen: false,
		}));
	};

	useEffect(() => {
		const storedRaw = store(id);
		if (!storedRaw) return;

		// For `format: "filter"`, the stored value is a CSS filter chain
		// (e.g. "brightness(0) saturate(100%) invert(50%) ..."). It can't be
		// rendered in a color picker, so leave drawerState at the default and
		// let the user re-pick a colour if they want to change it. The chain
		// remains in store2 for the save payload until they do.
		if (format === "filter" && /\b(brightness|contrast|sepia|saturate|hue-rotate|invert)\(/i.test(storedRaw)) {
			return;
		}

		// "Linked" field — its stored value is a single `var(--something)`
		// reference (this is what `linkedExpressionFor` produces for fields
		// with a single-key `baseRoot`). The picker can't show a var() ref;
		// resolve it to a literal using the parent's CURRENT value. Prefer
		// store2 over `getComputedStyle(:root)` because effects fire children
		// first — this drawer's effect runs BEFORE DraftHydrator has painted
		// the roots, so `:root` would still be empty for keys outside the
		// previously-active section (e.g. switching to the login tab where
		// `--primary-color` lives in `login_roots`).
		const singleVarMatch =
			typeof storedRaw === "string" &&
			storedRaw.trim().match(/^var\(\s*(--[\w-]+)\s*\)\s*$/);
		if (singleVarMatch) {
			const parentKey = singleVarMatch[1];
			const storedParent = store(parentKey);
			let resolved = "";
			if (typeof storedParent === "string" && storedParent.trim()) {
				resolved = storedParent.trim();
			} else {
				resolved = getComputedStyle(document.documentElement)
					.getPropertyValue(parentKey)
					.trim();
			}
			// `wrapWithFormat` will wrap a bare raw tuple ("70, 95, 215") with
			// rgb()/hsl() etc. so the picker can parse it.
			const cssDisplay = wrapWithFormat(resolved || "#000000", format);
			setDrawerState((prevState) => ({
				...prevState,
				color: cssDisplay,
			}));
			return;
		}

		// For `format: "gradient"`, the stored value IS a full CSS gradient
		// expression — feed it straight to the picker, which auto-detects
		// gradient mode from the value and renders the gradient editor.
		if (format === "gradient") {
			setDrawerState((prevState) => ({
				...prevState,
				color: storedRaw,
			}));
			return;
		}

		// All other formats: wrap the raw tuple back into a full CSS string
		// so the picker can parse it.
		const cssDisplay = wrapWithFormat(storedRaw, format);
		setDrawerState((prevState) => ({
			...prevState,
			color: cssDisplay,
		}));
		// eslint-disable-next-line
	}, [id, format, rootsVersion]);

	return (
		<DrawerRoot open={drawerState.isOpen} onInteractOutside={handleClose}>
			<DrawerBackdrop />
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Select a color</DrawerTitle>
				</DrawerHeader>
				<DrawerBody p={"0"} display="flex">
					<Box w="100%" display="flex" justifyContent="center">
						{drawerState.isOpen && (
							<ColorPickerInner
								id={id}
								drawerState={drawerState}
								setDrawerState={setDrawerState}
								format={format}
							/>
						)}
					</Box>
				</DrawerBody>
				<DrawerFooter>
					<DrawerActionTrigger asChild>
						<Button variant="outline" onClick={handleClose}>
							Close
						</Button>
					</DrawerActionTrigger>
				</DrawerFooter>
				<DrawerCloseTrigger onClick={handleClose} />
			</DrawerContent>
		</DrawerRoot>
	);
};

export default ColorDrawer;
