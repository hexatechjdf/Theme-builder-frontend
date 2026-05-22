import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { LuPalette } from "react-icons/lu";
import { brand } from "../../theme";

interface AuthLayoutProps {
	/** Main heading inside the card, e.g. "Welcome back". */
	title: string;
	/** Supporting line under the heading. */
	subtitle: string;
	/** Form / body content. */
	children: React.ReactNode;
	/** Optional row beneath the card body (links, secondary actions). */
	footer?: React.ReactNode;
}

/*
 * Shared shell for the standalone auth screens (Login / Forgot Password /
 * Reset Password). Centralises the brand lockup, gradient canvas and card
 * styling so all three screens are visually identical and consistent with
 * the in-CRM workspace. Purely presentational — pages keep their own forms
 * and logic.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
	title,
	subtitle,
	children,
	footer,
}) => {
	return (
		<Flex
			minH="100vh"
			align="center"
			justify="center"
			p={{ base: 4, md: 6 }}
			bg={brand.primaryHover}
			backgroundImage={`radial-gradient(circle at 12% 8%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 88% 92%, rgba(0,0,0,0.20), transparent 45%), ${brand.gradient}`}
		>
			<Stack gap={6} w="100%" maxW="420px" align="stretch">
				{/* Brand lockup — sits above the card on the gradient canvas. */}
				<Flex direction="column" align="center" gap={3}>
					<Flex
						align="center"
						justify="center"
						boxSize="52px"
						borderRadius="16px"
						bg="whiteAlpha.200"
						border="1px solid"
						borderColor="whiteAlpha.400"
						color="white"
						backdropFilter="blur(6px)"
					>
						<LuPalette size={26} />
					</Flex>
					<Stack gap={0.5} align="center">
						<Text
							fontSize="lg"
							fontWeight="bold"
							color="white"
							letterSpacing="tight"
						>
							Theme Builder
						</Text>
						<Text fontSize="xs" color="whiteAlpha.800">
							Customize your CRM, your way
						</Text>
					</Stack>
				</Flex>

				{/* Card */}
				<Box
					as="main"
					bg="white"
					borderRadius="2xl"
					boxShadow="0 20px 50px -12px rgba(43, 34, 107, 0.45)"
					p={{ base: 6, md: 8 }}
				>
					<Stack gap={1.5} mb={6}>
						<Heading
							as="h1"
							fontSize={{ base: "xl", md: "2xl" }}
							fontWeight="bold"
							color="gray.900"
							letterSpacing="tight"
						>
							{title}
						</Heading>
						<Text fontSize="sm" color="gray.500" lineHeight="1.6">
							{subtitle}
						</Text>
					</Stack>

					{children}
				</Box>

				{footer && (
					<Flex justify="center" fontSize="sm" color="whiteAlpha.900">
						{footer}
					</Flex>
				)}
			</Stack>
		</Flex>
	);
};

export default AuthLayout;
