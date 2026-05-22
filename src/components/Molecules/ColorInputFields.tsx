

import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Input, Text, chakra, parseColor } from "@chakra-ui/react";
import {
	ColorPickerControl,
	ColorPickerInput,
	ColorPickerLabel,
	ColorPickerRoot,
	ColorPickerTrigger,
	ColorPickerValueSwatch,
} from "../ui/color-picker.tsx";
import { useRecoilState } from "recoil";
import { customStyleColorValuesAtom } from "../store/customizationValueStore.ts";
import GetUpdateableList from "../Atoms/GetUpdateableList.tsx";
import store from "store2";
import { normalizeToFormat, wrapWithFormat } from "../utilities/formatColor";
import { writeRoot, useRootsVersion } from "../utilities/rootsLive";
import type { ColorFormat } from "../Dictionaries/themeSchema";

// Last-line guard: parseColor throws on unrecognized strings (e.g. a brief
// window during mount where drawerState still holds a raw tuple before
// ColorDrawer's hydration effect commits). Fall back to black instead of
// crashing the render.
const isParseableColor = (value: string): boolean => {
	if (!value) return false;
	const probe = new Option().style;
	probe.color = "";
	probe.color = value;
	return probe.color !== "";
};
const safeColorString = (value: string): string => {
	return isParseableColor(value) ? value : "#000000";
};

// Strip CSS qualifiers that aren't valid inside inline `style={{ background }}`
// — `!important` and a trailing `;` would otherwise make the browser drop the
// rule entirely (so the gradient preview chip would render blank).
const sanitizeForInlineStyle = (value: string | undefined | null): string => {
	if (!value) return "";
	return String(value)
		.replace(/\s*!\s*important\s*;?\s*$/i, "")
		.replace(/;\s*$/, "")
		.trim();
};
interface ColorInputFieldsProps {
	baesAttributes: boolean;
	label: {
		label: string;
		pre: string;
		current: string;
	};
	id: string; // Unique ID for state
	format?: ColorFormat;
	onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorInputFields: React.FC<ColorInputFieldsProps> = ({
	label,
	id,
	baesAttributes,
	format,
}) => {
	const [drawerState, setDrawerState] = useRecoilState(
		customStyleColorValuesAtom(id)
	);
	// Subscribe to the roots bus so the swatch re-renders the instant ANY
	// `--*` variable changes — covers the "linked field follows parent" case
	// where `drawerState.color` itself is the resolved literal (and so doesn't
	// change reference) but the underlying var() target just got a new value
	// painted onto `:root`. Without this hook, the swatch could stay stale
	// until ColorDrawer's mount-effect chain catches up.
	useRootsVersion();
	const isFirstRender = useRef(true);
	const [inputValue, setInputValue] = useState(drawerState.color || "");



	// const debounced = useDebouncedCallback(() => {
	// 	console.log({
	// 		[id]: drawerState.color,
	// 		companyId: "xxxxxxx",
	// 		label: drawerState.current,
	// 		pre: drawerState.pre,
	// 	});
	// }, 800);

	// const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	// 	const newColor = event.target.value;

	// 	if (drawerState.color !== newColor) {
	// 		setDrawerState((prevState) => ({
	// 			...prevState,
	// 			color: newColor,
	// 		}));
	// 	}
	// };

	useEffect(() => {
		setDrawerState((prevState) => ({
			...prevState,
			pre: label.pre,
		}));
		// eslint-disable-next-line
	}, [id]);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		// if (drawerState.color) {
		// 	debounced();
		// }
		// eslint-disable-next-line
	}, [drawerState.color]);

	// Note: we deliberately do NOT mirror drawerState.color → store here.
	// ColorDrawer is the single writer for picker-driven changes — it already
	// produces the format-correct value (raw tuple for rgb/hsl, hex for hex,
	// CSS filter chain for filter). A mirror effect would clobber the filter
	// chain with the picker's plain colour.

	const setDrawerOpen = (isOpen: boolean) => {
		if (drawerState.isOpen !== isOpen) {
			setDrawerState((prevState) => ({
				...prevState,
				isOpen,
				isLoaded: true,
			}));
		}
	};

	const isValidColor = (color: string): boolean => {
		const s = new Option().style;
		s.color = "";
		s.color = color;
		return s.color !== "";
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const typed = event.target.value;
		setInputValue(typed); // local display follows whatever the user typed
		// Whatever the user types (CSS color, hex, rgb()), normalize to the
		// schema's declared format before persisting. For `filter` fields this
		// produces a CSS filter chain; for rgb/hsl a raw tuple; for hex a #hex.
		// `writeRoot` also paints :root and bumps the live-cascade bus so any
		// linked children re-resolve without a reload.
		writeRoot(id, normalizeToFormat(typed, format));
		const changedList = store("changedList") || [];
		if (!changedList.includes(id)) {
			changedList.push(id);
			store("changedList", changedList);
		}
	};

	const handleInputBlur = () => {
		if (isValidColor(inputValue)) {
			setDrawerState((prev) => ({
				...prev,
				color: inputValue,
			}));
		}
	};

	useEffect(() => {
		setInputValue(drawerState.color || "");
	}, [drawerState.color]);

	const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			handleInputBlur();
		}
	}


	// console.log("color", drawerState.color)



	// inside ColorInputFields
	const resolveColor = (color: string): string => {
		if (color?.startsWith("var(")) {
			const varName = color.replace(/var\(|\)/g, "");
			const stored = store(varName);
			if (stored) return wrapWithFormat(stored, format);

			const resolved = getComputedStyle(document.documentElement)
				.getPropertyValue(varName)
				.trim();

			return resolved || "#000";
		}
		// drawerState.color SHOULD already be a full CSS string (wrapped by
		// ColorDrawer's mount effect), but if the picker rendered before that
		// effect committed, wrap on the fly so parseColor doesn't crash.
		return wrapWithFormat(color, format);
	};



	// Gradient fields can't go through Chakra's ColorPickerRoot — parseColor
	// rejects `linear-gradient(...)` strings and the swatch would collapse to
	// "#000000" via safeColorString. Render a dedicated preview chip (Box
	// with `background: <gradient>`) + text input that opens the gradient
	// drawer on click.
	if (format === "gradient") {
		return (
			<Box>
				<Text textTransform="uppercase" fontSize="11px" fontWeight="semibold" letterSpacing="0.06em" color="#64748b" mb="6px">
					{label.label}
				</Text>
				<Flex gap={2} align="center">
					<chakra.button
						type="button"
						onClick={() => setDrawerOpen(true)}
						w="38px"
						h="38px"
						minW="38px"
						borderRadius="md"
						border="1px solid"
						borderColor="gray.300"
						cursor="pointer"
						aria-label={`Open gradient editor for ${label.label}`}
						style={{ background: sanitizeForInlineStyle(drawerState.color) || "#000000" }}
					/>
					<Input
						size="sm"
						value={inputValue}
						onChange={handleInputChange}
						onBlur={handleInputBlur}
						onKeyDown={handleEnterPress}
						placeholder="linear-gradient(...)"
						flex={1}
					/>
				</Flex>
			</Box>
		);
	}

	return (
		<ColorPickerRoot value={parseColor(safeColorString(resolveColor(drawerState.color)))} minW="50px">


			{baesAttributes && (
				<GetUpdateableList id={id} color={drawerState.color} />
			)}
			<ColorPickerLabel
				textTransform="uppercase"
				fontSize="11px"
				fontWeight="semibold"
				letterSpacing="0.06em"
				color="#64748b"
				mb="6px"
			>
				{label.label}
			</ColorPickerLabel>

			<ColorPickerControl gap={2.5} alignItems="center">
				<ColorPickerTrigger
					onClick={() => setDrawerOpen(true)}
					boxSize="38px"
					minW="38px"
					p={0}
					borderRadius="10px"
					border="1px solid"
					borderColor="ink.200"
					overflow="hidden"
					_hover={{ borderColor: "ink.300" }}
				>
					<ColorPickerValueSwatch boxSize="100%" borderRadius="9px" />
				</ColorPickerTrigger>
				<ColorPickerInput
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputBlur}
					onKeyDown={handleEnterPress}
					flex="1"
					h="38px"
					borderRadius="10px"
					border="1px solid"
					borderColor="ink.200"
					bg="ink.50"
					color="ink.700"
					fontWeight="medium"
					_hover={{ borderColor: "ink.300" }}
					_focus={{
						borderColor: "brand.400",
						bg: "white",
						boxShadow: "0 0 0 1px #818cf8",
					}}
				/>
			</ColorPickerControl>
			<Text fontSize="11px" color="ink.400" mt={1.5}>
				Click swatch to pick
			</Text>
		</ColorPickerRoot>
	);
};

export default ColorInputFields;
