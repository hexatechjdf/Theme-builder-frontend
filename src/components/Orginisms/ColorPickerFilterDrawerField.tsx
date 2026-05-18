import React from "react";
import ColorDrawer from "../Molecules/ColorDrawer";
import { Box } from "@chakra-ui/react";
import ColorFIlteringInputField from "../Molecules/ColorFilterInputField";

interface ColorPickerDrawerInputFieldProps {
	label: string;
	id: string;
}

const ColorPickerFilterDrawerField: React.FC<
	ColorPickerDrawerInputFieldProps
> = ({ label, id }) => {
	return (
		<Box>
			<ColorDrawer id={id} />
			<ColorFIlteringInputField label={label} id={id} />
		</Box>
	);
};

export default ColorPickerFilterDrawerField;
