import { Box, Button, Card, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuTriangleAlert } from "react-icons/lu";

type Tone = "error" | "info";

const TONES: Record<Tone, { iconBg: string; iconColor: string }> = {
	error: { iconBg: "#FEE2E2", iconColor: "#DC2626" },
	info: { iconBg: "#eef2ff", iconColor: "#4f46e5" },
};

interface FeedbackStateProps {
	/** Visual tone — drives the icon chip colour. */
	tone?: Tone;
	/** Icon node; defaults to a warning triangle. */
	icon?: ReactNode;
	/** Short headline. */
	title: string;
	/** Supporting explanation. */
	description?: string;
	/** Optional action button label. */
	actionLabel?: string;
	/** Handler for the action button. */
	onAction?: () => void;
}

/*
 * Calm, consistent card for non-happy-path states (load failures, empty
 * results). Replaces bare red error text so a failure still looks like a
 * considered part of the product, not a crash.
 */
const FeedbackState: React.FC<FeedbackStateProps> = ({
	tone = "error",
	icon,
	title,
	description,
	actionLabel,
	onAction,
}) => {
	const palette = TONES[tone];
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
					w="60px"
					h="60px"
					align="center"
					justify="center"
					borderRadius="full"
					bg={palette.iconBg}
					color={palette.iconColor}
				>
					{icon ?? <LuTriangleAlert size={26} />}
				</Flex>
				<Box>
					<Text
						fontSize={{ base: "md", md: "lg" }}
						fontWeight="bold"
						color="gray.800"
					>
						{title}
					</Text>
					{description && (
						<Text
							mt={1.5}
							fontSize="sm"
							color="gray.500"
							maxW="420px"
						>
							{description}
						</Text>
					)}
				</Box>
				{actionLabel && onAction && (
					<Button
						onClick={onAction}
						colorPalette="brand"
						size="sm"
						borderRadius="lg"
					>
						{actionLabel}
					</Button>
				)}
			</Flex>
		</Card.Root>
	);
};

export default FeedbackState;
