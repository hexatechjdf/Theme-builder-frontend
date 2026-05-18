import InputField from "../Molecules/InputField";
import { Grid } from "@chakra-ui/react";

interface StyleInputSectionSideBarWidthProps {
	inputLabelObject: {
		[key: string]: {
			label: string;
			pre: string;
			current: string;
		};
	};
	type?: "number" | "text";
	placehoder?: string;
}

const StyleInputSectionSideBarWidth: React.FC<
	StyleInputSectionSideBarWidthProps
> = ({ inputLabelObject, type = "number", placehoder = "0" }) => {
	return (
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
			{/* eslint-disable-next-line */}
			{Object.entries(inputLabelObject).map(([key, value]) => (
				<InputField
					key={key}
					label={inputLabelObject[key].label}
					refData={inputLabelObject[key]}
					id={key}
					placehoder={placehoder}
					type={type}
				/>
			))}
		</Grid>
	);
};

export default StyleInputSectionSideBarWidth;
