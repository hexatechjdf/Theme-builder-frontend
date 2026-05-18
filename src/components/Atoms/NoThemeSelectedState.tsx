import { Box, Card, Flex, Text } from "@chakra-ui/react";
import { LuPalette } from "react-icons/lu";

const NoThemeSelectedState = () => {
	return (
		<Card.Root
			mx={{ base: 2, md: 6 }}
			mt={{ base: 4, md: 6 }}
			p={{ base: 8, md: 12 }}
			shadow="sm"
			borderRadius="xl"
			bg="white"
		>
			<Flex direction="column" align="center" gap={4} textAlign="center">
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
					<Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="gray.800">
						No theme selected
					</Text>
					<Text mt={1} fontSize={{ base: "sm", md: "md" }} color="gray.500" maxW="420px">
						Please select a theme from the library above to start customizing.
					</Text>
				</Box>
			</Flex>
		</Card.Root>
	);
};

export default NoThemeSelectedState;
