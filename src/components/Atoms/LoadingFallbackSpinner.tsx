import { Center, Spinner, Stack, Text } from "@chakra-ui/react";

interface LoadingFallbackProps {
	/** Optional message shown under the spinner. */
	label?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
	label = "Loading your workspace…",
}) => (
	<Center minH="50vh">
		<Stack align="center" gap={4}>
			<Spinner
				size="xl"
				color="brand.500"
				borderWidth="3px"
				animationDuration="0.7s"
			/>
			<Text fontSize="sm" color="gray.500" fontWeight="medium">
				{label}
			</Text>
		</Stack>
	</Center>
);

export default LoadingFallback;
