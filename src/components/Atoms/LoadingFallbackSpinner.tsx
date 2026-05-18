import { Spinner, Center } from "@chakra-ui/react";

const LoadingFallback = () => (
	<Center minH="50vh">
		<Spinner size="xl" color="teal.500" />
	</Center>
);

export default LoadingFallback