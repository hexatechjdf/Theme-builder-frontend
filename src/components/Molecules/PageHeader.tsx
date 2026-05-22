import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuInfo } from "react-icons/lu";
import {
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "../ui/popover";
import { brand } from "../../theme";

interface PageHeaderProps {
	/** Icon element (e.g. a react-icons node) shown in the accent chip. */
	icon: ReactNode;
	/** Page title. */
	title: string;
	/** Plain-language explanation — shown in the info popover, not inline. */
	description: string;
	/** Optional right-aligned content (badges, secondary actions). */
	children?: ReactNode;
}

/*
 * Compact, single-line page header: accent icon + title + an info button.
 * The longer explanation lives behind the (i) button so the header stays
 * lean — the user can tap it for context when they want it.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
	icon,
	title,
	description,
	children,
}) => {
	return (
		<Flex
			mx={{ base: 2, md: 6 }}
			mt={{ base: 2, md: 3 }}
			mb={{ base: 3.5, md: 5 }}
			gap={3}
			align="center"
			justify="space-between"
		>
			<Flex gap={2.5} align="center" minW={0}>
				<Flex
					align="center"
					justify="center"
					boxSize={{ base: "34px", md: "38px" }}
					borderRadius="10px"
					bgImage={brand.gradientSoft}
					color="white"
					flexShrink={0}
					boxShadow={brand.shadow}
				>
					{icon}
				</Flex>
				<Text
					fontSize={{ base: "md", md: "lg" }}
					fontWeight="bold"
					color="ink.900"
					letterSpacing="-0.01em"
					lineHeight="1.2"
					truncate
				>
					{title}
				</Text>
				<PopoverRoot positioning={{ placement: "bottom-start" }}>
					<PopoverTrigger asChild>
						<IconButton
							aria-label="About this page"
							size="xs"
							variant="ghost"
							color="ink.400"
							borderRadius="full"
							flexShrink={0}
							_hover={{ color: "brand.600", bg: "brand.50" }}
						>
							<LuInfo size={15} />
						</IconButton>
					</PopoverTrigger>
					<PopoverContent maxW="280px" borderRadius="12px">
						<PopoverBody
							fontSize="sm"
							color="ink.600"
							lineHeight="1.6"
						>
							{description}
						</PopoverBody>
					</PopoverContent>
				</PopoverRoot>
			</Flex>
			{children && <Box flexShrink={0}>{children}</Box>}
		</Flex>
	);
};

export default PageHeader;
