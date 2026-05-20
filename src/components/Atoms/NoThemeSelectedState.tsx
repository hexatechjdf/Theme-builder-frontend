import { Box, Button, Card, Flex, Text } from "@chakra-ui/react";
import { LuPalette } from "react-icons/lu";

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
			p={{ base: 8, md: 12 }}
			shadow="sm"
			borderRadius="xl"
			bg="white"
		>
			<Flex direction="column" align="center" gap={5} textAlign="center">
				<Flex
					w="64px"
					h="64px"
					align="center"
					justify="center"
					borderRadius="full"
					bg="rgba(115, 93, 255, 0.10)"
					color="#735DFF"
				>
					<LuPalette size={28} />
				</Flex>
				<Box>
					<Text
						fontSize={{ base: "lg", md: "xl" }}
						fontWeight="bold"
						color="gray.800"
					>
						No theme selected yet
					</Text>
					<Text
						mt={1.5}
						fontSize={{ base: "sm", md: "md" }}
						color="gray.500"
						maxW="420px"
					>
						Pick a theme to start customizing its colors, fonts, and
						spacing.
					</Text>
				</Box>
				{onSelectTheme && (
					<Button
						onClick={onSelectTheme}
						bg="#735DFF"
						color="white"
						_hover={{ bg: "#5b48d9" }}
						_active={{ bg: "#4c3cc7" }}
						size="md"
						px={6}
						gap={2}
						borderRadius="lg"
						boxShadow="0 4px 12px rgba(115, 93, 255, 0.30)"
					>
						<LuPalette size={16} />
						Select Theme
					</Button>
				)}
			</Flex>
		</Card.Root>
	);
};

export default NoThemeSelectedState;
