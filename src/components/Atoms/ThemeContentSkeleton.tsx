import { Box, Card, Flex, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { brand } from "../../theme";

interface ThemeContentSkeletonProps {
	/** How many placeholder field tiles to render. Defaults to a count that
	 *  roughly fills two rows on a desktop 4-column grid. */
	tiles?: number;
}

/*
 * Loading placeholder shaped EXACTLY like a real DynamicSection card — same
 * outer card dimensions, indigo header band, and grey grid of field tiles.
 * Swapping this in for the old centred spinner means the layout no longer
 * jumps from a tiny spinner to a full-width card when the schema + draft
 * finish loading; the skeleton already occupies the same footprint.
 */
const ThemeContentSkeleton: React.FC<ThemeContentSkeletonProps> = ({
	tiles = 8,
}) => {
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
			boxShadow={brand.cardShadow}
			overflow="hidden"
		>
			{/* Header band — keeps the real indigo identity so there's no colour
			    flash on load; translucent white skeletons stand in for the icon
			    and title lines. */}
			<Flex
				align="center"
				gap={3}
				px={{ base: 3.5, md: 5 }}
				py={{ base: 2.5, md: 3.5 }}
				bgImage={brand.gradient}
			>
				<Skeleton
					boxSize={{ base: "36px", md: "40px" }}
					borderRadius="10px"
					bg="whiteAlpha.500"
					flexShrink={0}
				/>
				<Stack gap={2} flex={1} minW={0}>
					<Skeleton
						h="14px"
						w={{ base: "55%", md: "190px" }}
						borderRadius="full"
						bg="whiteAlpha.500"
					/>
					<Skeleton
						h="10px"
						w={{ base: "40%", md: "140px" }}
						borderRadius="full"
						bg="whiteAlpha.300"
					/>
				</Stack>
			</Flex>

			{/* Body — grey field with white tiles, matching the real grid. */}
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
					{Array.from({ length: tiles }).map((_, i) => (
						<GridItem key={i} h="full">
							<Box
								h="full"
								bg="white"
								border="1px solid"
								borderColor="ink.300"
								borderRadius="12px"
								boxShadow={brand.tileShadow}
								p={{ base: 3, md: 3.5 }}
							>
								{/* eyebrow label */}
								<Skeleton h="9px" w="45%" borderRadius="full" mb="12px" />
								{/* control row: swatch + input */}
								<Flex gap={2.5} align="center">
									<Skeleton
										boxSize="38px"
										borderRadius="10px"
										flexShrink={0}
									/>
									<Skeleton h="38px" flex="1" borderRadius="10px" />
								</Flex>
								{/* helper text */}
								<Skeleton h="8px" w="35%" borderRadius="full" mt="10px" />
							</Box>
						</GridItem>
					))}
				</Grid>
			</Box>
		</Card.Root>
	);
};

export default ThemeContentSkeleton;
