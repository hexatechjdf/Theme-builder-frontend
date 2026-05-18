import React from "react";
import { Grid, GridItem, Text } from "@chakra-ui/react";
import ColorPickerDrawerInputField from "./ColorPickerDrawerInputField";

interface StyleInputSectionProps {
	isLabel?: boolean;
	section_label: string;
	baesAttributes?: boolean;
	inputs: {
		[key: string]: {
			label: string;
			pre: string;
			current: string;
		};
	};
}

const StyleInputSection: React.FC<StyleInputSectionProps> = ({
	isLabel = true,
	section_label,
	inputs,
	baesAttributes = false,
}) => {
	if (!inputs) {
		return null;
	}

	return (
		<>
			{isLabel && (
				<Text fontSize="xl" mb="4">
					{section_label}
				</Text>
			)}

			<Grid
				templateColumns={{
					base: "repeat(1, 1fr)",
					sm: "repeat(2, 1fr)",
					md: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
					xl: "repeat(4, 1fr)",
				}}
				gap={{ base: 4, md: 6 }}
			>
				{Object.entries(inputs).map(([key, label]) => (
					<GridItem key={key}>
						<ColorPickerDrawerInputField
							baesAttributes={baesAttributes}
							label={inputs[key]}
							id={key}
						/>
					</GridItem>
				))}
			</Grid>
		</>
	);
};

export default StyleInputSection;
