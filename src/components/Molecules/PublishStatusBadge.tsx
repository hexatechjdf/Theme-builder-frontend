import { useRecoilValue } from "recoil";
import { Box, HStack, Text } from "@chakra-ui/react";
import { publishStatusAtom } from "../Atoms/publishStatus";

const PublishStatusBadge = () => {
	const status = useRecoilValue(publishStatusAtom);
	const isLive = status === "live";

	return (
		<HStack
			h="32px"
			gap={1.5}
			px={3}
			borderRadius="full"
			bg={isLive ? "whiteAlpha.200" : "#FBBF24"}
			border="1px solid"
			borderColor={isLive ? "whiteAlpha.300" : "#F59E0B"}
			flexShrink={0}
			transition="all 0.2s"
			title={
				isLive
					? "All your changes are live"
					: "You have unpublished draft changes — click Publish to push them live"
			}
		>
			<Box
				w="7px"
				h="7px"
				borderRadius="full"
				bg={isLive ? "green.300" : "#7C2D12"}
				flexShrink={0}
			/>
			<Text
				fontSize="xs"
				color={isLive ? "white" : "#451A03"}
				fontWeight="semibold"
				lineHeight="1"
			>
				{isLive ? "Live" : "Draft"}
			</Text>
		</HStack>
	);
};

export default PublishStatusBadge;
