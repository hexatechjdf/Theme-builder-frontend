import React from "react";
import { Box, Card, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { LuSlidersHorizontal } from "react-icons/lu";
import DynamicFieldRenderer from "./DynamicFieldRenderer";
import type { SchemaSection } from "../Dictionaries/themeSchema";
import { brand } from "../../theme";

interface Props {
	section: SchemaSection;
	// When the card sits directly under a tab bar, square its top-left corner
	// so the tabs read as attached to the card instead of floating above a
	// rounded corner.
	attachedTop?: boolean;
}

const DynamicSection: React.FC<Props> = ({ section, attachedTop = false }) => {
	// Admin can flip `enabled: false` on individual fields to hide them
	// without removing them from the schema. Treat missing `enabled` as true.
	const visibleFields = section.fields.filter((f) => f.enabled !== false);

	// Skip the whole section if nothing is left to show (otherwise the user
	// sees an empty card with just a title).
	if (!visibleFields.length) return null;

	const fieldCount = visibleFields.length;

	return (
		<Card.Root
			mx={{ base: 2, md: 6 }}
			mt={0}
			mb={{ base: 3, md: 5 }}
			p={0}
			gap={0}
			bg="white"
			border="1px solid"
			borderColor="ink.300"
			borderRadius="16px"
			borderTopLeftRadius={attachedTop ? "0" : "16px"}
			boxShadow={brand.cardShadow}
			overflow="hidden">
				
			{/* Header — solid indigo. A bold, coloured band gives the section
			    card an unmistakable identity instead of blending into the
			    surrounding white/grey surfaces. */}
			<Flex
				align="center"
				gap={3}
				px={{ base: 3.5, md: 5 }}
				py={{ base: 2.5, md: 3.5 }}
				bgImage={brand.gradient}
			>
				<Flex
					align="center"
					justify="center"
					boxSize={{ base: "36px", md: "40px" }}
					borderRadius="10px"
					bg="whiteAlpha.200"
					border="1px solid"
					borderColor="whiteAlpha.400"
					color="white"
					flexShrink={0}
				>
					<LuSlidersHorizontal size={19} />
				</Flex>
				<Box minW={0}>
					<Text
						fontSize={{ base: "sm", md: "md" }}
						fontWeight="bold"
						color="white"
						letterSpacing="-0.01em"
						truncate
						lineHeight="1.3"
					>
						{section.title}
					</Text>
					<Text
						fontSize="xs"
						color="whiteAlpha.800"
						fontWeight="medium"
					>
						{fieldCount} {fieldCount === 1 ? "setting" : "settings"} to
						customize
					</Text>
				</Box>
			</Flex>

			{/* Body — fields sit in clearly-bordered tiles on a grey field so
			    each setting reads as a separate, obvious control. */}
			<Box bg="ink.100" p={{ base: 3, md: 4 }}>
				<Grid
					templateColumns={{
						base: "repeat(1, 1fr)",
						sm: "repeat(2, 1fr)",
						md: "repeat(3, 1fr)",
						lg: "repeat(4, 1fr)",
					}}
					gap={{ base: 2.5, md: 3 }}
				>
					{visibleFields.map((field) => (
						<GridItem key={field.key} h="full">
							<Box
								h="full"
								bg="white"
								border="1px solid"
								borderColor="ink.300"
								borderRadius="12px"
								boxShadow={brand.tileShadow}
								p={{ base: 3, md: 3.5 }}
								transition="border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease"
								_hover={{
									borderColor: "brand.400",
									boxShadow:
										"0 8px 20px -5px rgba(16, 24, 40, 0.18)",
									transform: "translateY(-2px)",
								}}
								// Uppercase, letter-spaced grey "eyebrow" style for
								// every field label inside the tile (Field.Label and
								// the colour picker label are both <label> elements).
								// Scoped here so the auth-page form labels stay normal.
								css={{
									"& label": {
										textTransform: "uppercase",
										fontSize: "11px",
										fontWeight: 600,
										letterSpacing: "0.06em",
										color: "#64748b",
										marginBottom: "6px",
									},
								}}
							>
								<DynamicFieldRenderer field={field} />
							</Box>
						</GridItem>
					))}
				</Grid>
			</Box>
		</Card.Root>
	);
};

export default React.memo(DynamicSection);
