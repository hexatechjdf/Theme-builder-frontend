import { useMemo } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import DynamicSection from "../Orginisms/DynamicSection";
import { useLoadersList } from "../services/api";
import { UseAllValues } from "../utilities/GetAllValues";
import { levelModeAtom } from "../Atoms/levelMode";
import type { SchemaSection } from "../Dictionaries/themeSchema";

// Loader save payload only carries `loader_id`, so the page only needs a
// single picker. The legacy image-url / animationTheme fields aren't part of
// the backend's loader contract and were removed to avoid implying they save.
const LoaderAnimation = () => {
	const { loaders } = useLoadersList();
	// Remount the loader picker on level switch so it re-reads store("animation")
	// fresh for the new account (mirrors Dashboard/LoginTheme rationale).
	const level = useRecoilValue(levelModeAtom);
	const currentLocationId =
		level.mode === "subaccount"
			? level.subaccountId ?? "agency"
			: "agency";

	const schema = useMemo<SchemaSection[]>(
		() => [
			{
				id: "loader-animation",
				title: "Loader Animation",
				fields: [
					{
						id: "animation",
						key: "animation",
						label: "Select loader",
						type: "select",
						options: loaders,
					},
				],
			},
		],
		[loaders]
	);

	return (
		<>
			<Flex
				position="sticky"
				top={0}
				zIndex={1}
				mx={{ base: 2, md: 6 }}
				px={{ base: 3, md: 4 }}
				py={2}
				bg="white"
				border="1px solid"
				borderColor="gray.200"
				borderRadius="md"
				shadow="xs"
				gap={3}
				direction={{ base: "column", sm: "row" }}
				align={{ base: "stretch", sm: "center" }}
				justify="space-between"
			>
				<Text
					fontSize="xs"
					color="gray.500"
					textTransform="uppercase"
					letterSpacing="wider"
					fontWeight="semibold"
				>
					Loader Animation
				</Text>
				<UseAllValues section="loader" />
			</Flex>

			{schema.map((section) => (
				<DynamicSection
					key={`${section.id}-${currentLocationId}`}
					section={section}
				/>
			))}
		</>
	);
};

export default LoaderAnimation;
