import React from "react";
import ColorDrawer from "../Molecules/ColorDrawer";
import ColorInputFields from "../Molecules/ColorInputFields";
import { Box } from "@chakra-ui/react";
import type { ColorFormat } from "../Dictionaries/themeSchema";

interface ColorPickerDrawerInputFieldProps {
	label: {
		label: string;
		pre: string;
		current: string;
	};
	id: string;
	baesAttributes?: boolean;
	format?: ColorFormat;
}

const ColorPickerDrawerInputField: React.FC<
	ColorPickerDrawerInputFieldProps
> = ({ label, id, baesAttributes = false, format }) => {
	return (
		<Box>
			<ColorDrawer id={id} format={format} />
			<ColorInputFields
				baesAttributes={baesAttributes}
				label={label}
				id={id}
				format={format}
			/>
		</Box>
	);
};

export default ColorPickerDrawerInputField;
