import React, { useState } from "react";
import {
	Box,
	Grid,
	GridItem,
	HStack,
	IconButton,
	Input,
	NativeSelect,
	Stack,
	Text,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import store from "store2";
import { Field } from "../ui/field";
import ColorPickerDrawerInputField from "./ColorPickerDrawerInputField";
import InputField from "../Molecules/InputField";
import { useFontList } from "../services/api";
import type { SchemaField } from "../Dictionaries/themeSchema";

interface Props {
	field: SchemaField;
}

const SIDES = ["top", "right", "bottom", "left"] as const;
type SideTuple = [string, string, string, string];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const pushChangedKey = (key: string) => {
	const list = (store("changedList") as string[]) || [];
	if (!list.includes(key)) {
		store("changedList", [...list, key]);
	}
};

// Parse "10px,20px,10px,15px" → ["10px","20px","10px","15px"].
// Falls back to CSS-shorthand expansion if fewer values are given:
//   1 → all 4 sides; 2 → tb/lr; 3 → t / lr / b; 4 → t/r/b/l.
const parseSides = (raw: string | undefined): SideTuple => {
	if (!raw) return ["", "", "", ""];
	const parts = raw
		.split(/[,\s]+/)
		.map((p) => p.trim())
		.filter(Boolean);
	if (parts.length === 0) return ["", "", "", ""];
	if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
	if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
	if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
	return [parts[0], parts[1], parts[2], parts[3]];
};

const joinSides = (sides: SideTuple): string =>
	sides.map((s) => s.trim()).join(",");

// One-input variant: writes a single string to `field.key`.
const SingleSpacingField: React.FC<Props> = ({ field }) => {
	const refData = { pre: "", current: field.defaultValue ?? "" };
	return (
		<InputField
			id={field.key}
			label={field.label}
			refData={refData}
			type="text"
		/>
	);
};

// "full" variant: same UI as single, but with a small hint that the value
// applies to all 4 sides — backend expands the value server-side.
const FullSpacingField: React.FC<Props> = ({ field }) => {
	const refData = { pre: "", current: field.defaultValue ?? "" };
	return (
		<Stack gap={1}>
			<InputField
				id={field.key}
				label={field.label}
				refData={refData}
				type="text"
			/>
			<Text fontSize="xs" color="gray.500">
				Applies to all 4 sides
			</Text>
		</Stack>
	);
};

// "custom" variant: 4 sides stored as ONE comma-separated string under field.key.
// Collapsed view exposes a single shorthand input that applies to all 4 sides.
const CustomSpacingField: React.FC<Props> = ({ field }) => {
	const initialRaw =
		(store(field.key) as string | undefined) ??
		field.value ??
		field.defaultValue ??
		"";
	const [sides, setSides] = useState<SideTuple>(parseSides(initialRaw));
	const [expanded, setExpanded] = useState(false);

	const writeSides = (next: SideTuple) => {
		setSides(next);
		const value = joinSides(next);
		store(field.key, value);
		pushChangedKey(field.key);
	};

	const updateSide = (idx: number, value: string) => {
		const next = [...sides] as SideTuple;
		next[idx] = value;
		writeSides(next);
	};

	const updateAll = (value: string) => {
		writeSides([value, value, value, value] as SideTuple);
	};

	const allEqual = sides.every((s) => s === sides[0]);
	const shorthandValue = allEqual ? sides[0] : sides.join(",");

	return (
		<Stack gap={3} w="full">
			<HStack justify="space-between" align="end" gap={2}>
				<Box flex="1" minW={0}>
					{expanded ? (
						<Text fontSize="sm" fontWeight="medium" color="gray.700">
							{field.label}
						</Text>
					) : (
						<Field label={field.label}>
							<Input
								value={shorthandValue}
								onChange={(e) => updateAll(e.target.value)}
								placeholder="e.g. 10px"
								variant="outline"
								minW="50px"
							/>
						</Field>
					)}
				</Box>
				<HStack gap={1} flexShrink={0}>
					<Text
						fontSize="xs"
						color="gray.500"
						userSelect="none"
						display={{ base: "none", sm: "inline" }}
					>
						{expanded ? "Combine sides" : "Customize sides"}
					</Text>
					<IconButton
						size="xs"
						variant="ghost"
						aria-label={expanded ? "Combine sides" : "Customize sides"}
						onClick={() => setExpanded((v) => !v)}
						borderRadius="md"
					>
						{expanded ? <LuChevronUp /> : <LuChevronDown />}
					</IconButton>
				</HStack>
			</HStack>

			<AnimatePresence initial={false}>
				{expanded && (
					<motion.div
						key="sides"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						style={{ overflow: "hidden", width: "100%" }}
					>
						<Box pt={1}>
							<Grid
								templateColumns={{
									base: "repeat(2, 1fr)",
									md: "repeat(4, 1fr)",
								}}
								gap={3}
								w="full"
							>
								{SIDES.map((side, i) => (
									<GridItem key={side}>
										<Field label={cap(side)}>
											<Input
												value={sides[i]}
												onChange={(e) => updateSide(i, e.target.value)}
												placeholder="0px"
												variant="outline"
												minW="50px"
											/>
										</Field>
									</GridItem>
								))}
							</Grid>
						</Box>
					</motion.div>
				)}
			</AnimatePresence>
		</Stack>
	);
};

const SelectField: React.FC<Props> = ({ field }) => {
	const initial =
		(store(field.key) as string | undefined) ??
		field.value ??
		field.defaultValue ??
		"";
	const [value, setValue] = useState<string>(initial);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const v = e.target.value;
		setValue(v);
		store(field.key, v);
		pushChangedKey(field.key);
	};

	const options = field.type === "select" ? field.options ?? [] : [];
	const hasOptions = options.length > 0;

	return (
		<Field label={field.label}>
			<NativeSelect.Root disabled={!hasOptions}>
				<NativeSelect.Field
					value={value}
					onChange={handleChange}
					placeholder={hasOptions ? "Select an option" : "No options"}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</NativeSelect.Field>
				<NativeSelect.Indicator />
			</NativeSelect.Root>
		</Field>
	);
};

// Same shape as SelectField, but options are fetched from GET /fonts-list at
// render time. React-query dedupes, so multiple `fonts` fields on the page
// share a single request.
const FontsField: React.FC<Props> = ({ field }) => {
	const { fonts, isLoading } = useFontList();
	const initial =
		(store(field.key) as string | undefined) ??
		field.value ??
		field.defaultValue ??
		"";
	const [value, setValue] = useState<string>(initial);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const v = e.target.value;
		setValue(v);
		store(field.key, v);
		pushChangedKey(field.key);
	};

	const hasOptions = fonts.length > 0;
	const placeholder = isLoading
		? "Loading fonts…"
		: hasOptions
			? "Select a font"
			: "No fonts available";

	return (
		<Field label={field.label}>
			<NativeSelect.Root disabled={!hasOptions}>
				<NativeSelect.Field
					value={value}
					onChange={handleChange}
					placeholder={placeholder}
				>
					{fonts.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</NativeSelect.Field>
				<NativeSelect.Indicator />
			</NativeSelect.Root>
		</Field>
	);
};

// Strips a CSS `url("…")` / url(…) wrapper down to the bare link. Image/URL
// fields are STORED wrapped (buildRoots emits `url("…")` so admin CSS can
// drop them straight into `background-image`), but the user should only ever
// see and edit the plain URL in the field.
const unwrapUrl = (raw: string): string => {
	const m = raw.trim().match(/^url\(\s*(['"]?)([\s\S]*?)\1\s*\)$/i);
	return m ? m[2].trim() : raw;
};

// `url`-type field. Displays the bare link; the value is stored unwrapped,
// and buildRoots (GetAllValues) re-wraps it as `url("…")` at save time.
const UrlInputField: React.FC<Props> = ({ field }) => {
	const initial = unwrapUrl(
		String(
			(store(field.key) as string | undefined) ??
				field.value ??
				field.defaultValue ??
				"",
		),
	);
	const [value, setValue] = useState<string>(initial);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value;
		setValue(next);
		store(field.key, next);
		pushChangedKey(field.key);
	};

	return (
		<Field label={field.label}>
			<Input
				value={value}
				onChange={handleChange}
				placeholder="https://example.com/image.png"
				variant="outline"
				minW="50px"
			/>
		</Field>
	);
};

const DynamicFieldRenderer: React.FC<Props> = ({ field }) => {
	if (!field?.key) {
		if (typeof console !== "undefined") {
			console.warn("DynamicFieldRenderer: field is missing a key", field);
		}
		return null;
	}

	const refData = { pre: "", current: field.defaultValue ?? "" };

	// `valueMode: "cssVar"` means the value is a CSS expression (var(),
	// linear-gradient(...), etc.). For NON-COLOUR types this can't be
	// represented in our typed pickers — render a plain text input.
	//
	// COLOUR fields are different: even a linked one like
	// `{ type: "color", format: "rgb", valueMode: "cssVar", baseRoot: "--primary-color" }`
	// is still semantically a colour, and ColorDrawer's mount effect already
	// resolves single-`var(--key)` references via `getComputedStyle` so the
	// picker shows the right starting colour. Always route colour fields to
	// the picker — gradient/filter use their own dedicated UI inside the
	// drawer; rgb/hex/hsl get the regular swatch picker that auto-detaches
	// on a direct edit. The cssVar→text-input fallback below only fires for
	// type: "text" / "number" / etc.
	if (field.valueMode === "cssVar" && field.type !== "color") {
		return (
			<InputField
				id={field.key}
				label={field.label}
				refData={refData}
				type="text"
			/>
		);
	}

	switch (field.type) {
		case "color":
			return (
				<ColorPickerDrawerInputField
					id={field.key}
					baesAttributes={false}
					label={{ label: field.label, pre: "", current: refData.current }}
					format={field.format}
				/>
			);

		case "text":
			return (
				<InputField
					id={field.key}
					label={field.label}
					refData={refData}
					type="text"
				/>
			);

		case "url":
			// Image/URL field — shows the bare link. buildRoots re-wraps it
			// as `url("…")` at save time (see GetAllValues).
			return <UrlInputField field={field} />;

		case "number":
			return (
				<InputField
					id={field.key}
					label={field.label}
					refData={refData}
					type="number"
				/>
			);

		case "select":
			return <SelectField field={field} />;

		case "fonts":
			return <FontsField field={field} />;

		case "spacing":
			if (field.variant === "full") return <FullSpacingField field={field} />;
			if (field.variant === "custom") return <CustomSpacingField field={field} />;
			return <SingleSpacingField field={field} />;

		default: {
			if (typeof console !== "undefined") {
				console.warn("DynamicFieldRenderer: unknown field type", field);
			}
			return (
				<Box fontSize="xs" color="gray.500">
					Unsupported field type: {(field as SchemaField).type}
				</Box>
			);
		}
	}
};

export default React.memo(DynamicFieldRenderer);
