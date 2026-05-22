import { Box, Button, Card, Flex, Text } from "@chakra-ui/react";
import { LuPalette } from "react-icons/lu";
import { brand } from "../../theme";

interface NoThemeSelectedStateProps {
	// Opens the theme picker. Optional — pages that don't wire it still get a
	// valid (button-less) empty state.
	onSelectTheme?: () => void;
}

const NoThemeSelectedState: React.FC<NoThemeSelectedStateProps> = ({
	onSelectTheme,
}) => {
	return (
		<Card.Root
			mx={{ base: 2, md: 6 }}
			mt={{ base: 4, md: 6 }}
			p={{ base: 10, md: 16 }}
			bg="white"
			border="1px solid"
			borderColor="ink.200"
			shadow={brand.cardShadow}
			borderRadius="2xl"
		>
			<Flex direction="column" align="center" gap={5} textAlign="center">
				<Flex
					w="72px"
					h="72px"
					align="center"
					justify="center"
					borderRadius="20px"
					bgImage={brand.gradientSoft}
					color="white"
					boxShadow={brand.shadow}
				>
					<LuPalette size={32} />
				</Flex>
				<Box>
					<Text
						fontSize={{ base: "lg", md: "xl" }}
						fontWeight="bold"
						color="ink.900"
						letterSpacing="-0.01em"
					>
						No theme selected yet
					</Text>
					<Text
						mt={2}
						fontSize={{ base: "sm", md: "md" }}
						color="ink.500"
						maxW="440px"
						lineHeight="1.65"
					>
						Choose a theme to start customizing its colors, fonts, and
						spacing. You can preview any theme before you apply it.
					</Text>
				</Box>
				{onSelectTheme && (
					<Button
						onClick={onSelectTheme}
						colorPalette="brand"
						size="lg"
						px={7}
						gap={2}
						borderRadius="12px"
						fontWeight="semibold"
						boxShadow={brand.shadow}
						_hover={{ boxShadow: brand.shadowHover }}
					>
						<LuPalette size={18} />
						Browse themes
					</Button>
				)}
			</Flex>
		</Card.Root>
	);
};

export default NoThemeSelectedState;
