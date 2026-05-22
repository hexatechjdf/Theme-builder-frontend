import { useMemo } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { TbLoader3 } from "react-icons/tb";
import { useRecoilValue } from "recoil";
import DynamicSection from "../Orginisms/DynamicSection";
import { useGetUpdatedUserThemeSetting, useLoadersList } from "../services/api";
import LoadingFallback from "../Atoms/LoadingFallbackSpinner";
import PageHeader from "../Molecules/PageHeader";
import StickyActionBar from "../Molecules/StickyActionBar";
import { UseAllValues } from "../utilities/GetAllValues";
import { levelModeAtom } from "../Atoms/levelMode";
import type { SchemaSection } from "../Dictionaries/themeSchema";

// Loader save payload only carries `loader_id`, so the page only needs a
// single picker. The legacy image-url / animationTheme fields aren't part of
// the backend's loader contract and were removed to avoid implying they save.
const LoaderAnimation = () => {
	const { loaders, isLoading: loadersLoading } = useLoadersList();
	// Gate field rendering on draft hydration. The saved loader pick lives in
	// the backend draft (`loader_id`) and is written into store("animation")
	// by the shared hydration inside useGetUpdatedUserThemeSetting — but only
	// after the draft fetch resolves. The loader <select> reads
	// store("animation") once on mount, so if it mounts first it reads the
	// empty store (wiped on boot by clearFieldCache) and shows "Select an
	// option" after reload. Waiting for `isHydrated` (like Dashboard /
	// LoginTheme do) ensures the value has landed before the select mounts.
	const { isHydrated } = useGetUpdatedUserThemeSetting();
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
			<PageHeader
				icon={<TbLoader3 size={22} />}
				title="Loader Animation"
				description="Choose the loading animation your users see while the CRM loads. Saved as a draft until you publish."
			/>

			<StickyActionBar>
				<Flex
					mx={{ base: 2, md: 6 }}
					mt={{ base: 1, md: 1.5 }}
					px={{ base: 2.5, md: 4 }}
					py={{ base: 1.5, md: 2 }}
					bg="white"
					border="1px solid"
					borderColor="ink.300"
					borderRadius="xl"
					boxShadow="0 2px 8px -2px rgba(16, 24, 40, 0.14)"
					gap={{ base: 2, md: 3 }}
					direction="row"
					align="center"
					justify="space-between"
				>
					<Text
						fontSize="xs"
						color="ink.500"
						textTransform="uppercase"
						letterSpacing="wider"
						fontWeight="bold"
						flexShrink={0}
					>
						Animation
					</Text>
					<UseAllValues section="loader" />
				</Flex>
			</StickyActionBar>

			{!isHydrated || loadersLoading ? (
				// Wait for the saved loader_id to hydrate into store("animation")
				// AND the loader options to load before mounting the select.
				<LoadingFallback />
			) : (
				schema.map((section) => (
					<DynamicSection
						key={`${section.id}-${currentLocationId}`}
						section={section}
					/>
				))
			)}
		</>
	);
};

export default LoaderAnimation;
