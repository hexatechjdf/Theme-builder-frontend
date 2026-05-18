import React from "react";
import { Grid, GridItem, Text } from "@chakra-ui/react";
import ColorPickerFilterDrawerField from "./ColorPickerFilterDrawerField";
interface StyleInputSectionProps {
	isLabel?: boolean;
	section_label: string;
	inputs: {
		[key: string]: {
			label: string;
		};
	};
}

const StyleFilterInputSection: React.FC<StyleInputSectionProps> = ({
	isLabel = true,
	section_label,
	inputs,
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
						<ColorPickerFilterDrawerField label={inputs[key].label} id={key} />
					</GridItem>
				))}
			</Grid>
		</>
	);
};

export default StyleFilterInputSection;
