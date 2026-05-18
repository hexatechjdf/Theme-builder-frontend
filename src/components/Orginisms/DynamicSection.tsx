import React from "react";
import { Card, Grid, GridItem, Text } from "@chakra-ui/react";
import DynamicFieldRenderer from "./DynamicFieldRenderer";
import type { SchemaSection } from "../Dictionaries/themeSchema";

interface Props {
	section: SchemaSection;
}

const DynamicSection: React.FC<Props> = ({ section }) => {
	// Admin can flip `enabled: false` on individual fields to hide them
	// without removing them from the schema. Treat missing `enabled` as true.
	const visibleFields = section.fields.filter((f) => f.enabled !== false);

	// Skip the whole section if nothing is left to show (otherwise the user
	// sees an empty card with just a title).
	if (!visibleFields.length) return null;

	return (
		<Card.Root
			p={{ base: 3, md: 6 }}
			m={{ base: 2, md: 6 }}
			shadow="sm"
			gap={{ base: 3, md: 4 }}
		>
			<Text fontSize={{ base: "md", md: "xl" }} mb={{ base: 2, md: 4 }}>
				{section.title}
			</Text>
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
				{visibleFields.map((field) => (
					<GridItem key={field.key}>
						<DynamicFieldRenderer field={field} />
					</GridItem>
				))}
			</Grid>
		</Card.Root>
	);
};

export default React.memo(DynamicSection);
