import React, { useEffect, useRef, useState } from "react";
import { Drawer, Flex, parseColor } from "@chakra-ui/react";
import {
	ColorPickerControl,
	ColorPickerInput,
	ColorPickerLabel,
	ColorPickerRoot,
	ColorPickerTrigger,
} from "../ui/color-picker.tsx";
import { useRecoilState } from "recoil";
import { customStyleColorValuesAtom } from "../store/customizationValueStore.ts";
import { useDebouncedCallback } from "use-debounce";
import CssFilterConverter from "css-filter-converter";
interface ColorInputFieldsProps {
	label: string;
	id: string; // Unique ID for state
	onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorFIlteringInputField: React.FC<ColorInputFieldsProps> = ({
	label,
	id,
}) => {
	const [drawerState, setDrawerState] = useRecoilState(
		customStyleColorValuesAtom(id)
	);
	const [color, setColor] = useState("");
	const isFirstRender = useRef(true);

	const debounced = useDebouncedCallback(() => {
		// console.log({
		// 	[id]: drawerState.color,
		// 	companyId: "xxxxxxx",
		// });
	}, 800);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (drawerState.color) {
			debounced();
		}
		// eslint-disable-next-line
	}, [drawerState.color]);

	const setDrawerOpen = (isOpen: boolean) => {
		if (drawerState.isOpen !== isOpen) {
			setDrawerState((prevState) => ({
				...prevState,
				isOpen,
			}));
		}
	};

	const isValidColor = (color: string) => {
		const canvas = document.createElement("canvas");
		canvas.style.color = color;
		return canvas.style.color !== "";
	};

	// if (isValidColor(drawerState.color)) {
	// 	CssFilterConverter.filterToHex(drawerState.color)
	// 		.then((res) => {
	// 			setColor(res.color);
	// 		})
	// 		.catch(() => {
	// 			setColor(drawerState.color); // fallback
	// 		});
	// } else {
	// 	setColor("#000000"); // fallback to black or a default color
	// }

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (!drawerState.color.includes("#")) {
			(async () => {
				const colorValue = await CssFilterConverter.filterToHex(
					drawerState.color
				);
				if (colorValue.color) setColor(colorValue.color);
			})();
		} else {
			setColor(drawerState.color);
		}
		// eslint-disable-next-line
	}, [drawerState.color, id]);
	// console.log(color);

	return (
		<ColorPickerRoot value={parseColor(color || "#fee")} minW="100px">
			<Flex>
				<ColorPickerLabel fontSize="xs">{label}</ColorPickerLabel>
			</Flex>

			<ColorPickerControl>
				<ColorPickerTrigger
					defaultValue={CssFilterConverter.hexToFilter(color).color ?? ''}
					onClick={() => setDrawerOpen(true)}
				/>

				<ColorPickerInput
					readOnly
					value={CssFilterConverter.hexToFilter(color).color ?? ''}
				/>
			</ColorPickerControl>
		</ColorPickerRoot>
	);
};

export default ColorFIlteringInputField;
