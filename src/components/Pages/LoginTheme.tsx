import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useUserTheme, {
	useGetUpdatedUserThemeSetting,
	useThemeRootSections,
} from "../services/api";
import { UseAllValues } from "../utilities/GetAllValues";
import ThemeSelectorDialog from "../Dictionaries/ThemeSelectorDialog";
import SchemaTabs from "../Orginisms/SchemaTabs";
import { selectedThemeFamily } from "../Atoms/selectedThemeState";
import { levelModeAtom } from "../Atoms/levelMode";
import NoThemeSelectedState from "../Atoms/NoThemeSelectedState";
import LoadingFallback from "../Atoms/LoadingFallbackSpinner";

const LoginTheme = () => {
	const { data, isLoading, error } = useUserTheme();
	// Subscribe to the saved-draft fetch so we can gate the field tree on
	// `isHydrated` — same race that bit Dashboard.tsx (see comment there).
	const { isHydrated, effectiveDraft } = useGetUpdatedUserThemeSetting();

	// Per-location selection. Each Level Switcher slot has its own pick.
	const level = useRecoilValue(levelModeAtom);
	const currentLocationId =
		level.mode === "subaccount"
			? level.subaccountId ?? "agency"
			: "agency";

	const [selectedTheme, setSelectedTheme] = useRecoilState(
		selectedThemeFamily({ themeType: "login", locationId: currentLocationId })
	);

	// Hydrate the per-location atom from the backend's inherited login_id
	// when this slot has never been picked — same rationale as Dashboard.
	useEffect(() => {
		if (selectedTheme !== null) return;
		if (!isHydrated) return;
		const inheritedId = effectiveDraft?.login_id;
		if (!inheritedId) return;
		const themes = data?.logins ?? [];
		const match = themes.find((t) => t.theme_uuid === inheritedId);
		if (match) {
			setSelectedTheme({
				theme_uuid: match.theme_uuid,
				title: match.title,
				image: match.image,
			});
		}
	}, [selectedTheme, isHydrated, effectiveDraft, data, setSelectedTheme]);

	const themeUuid = selectedTheme?.theme_uuid ?? null;
	const {
		sections,
		isLoading: isSchemaLoading,
		error: schemaError,
	} = useThemeRootSections(themeUuid);
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
				<Flex align="center" gap={2.5} minW={0}>
					<Text
						fontSize="xs"
						color="gray.500"
						textTransform="uppercase"
						letterSpacing="wider"
						fontWeight="semibold"
						flexShrink={0}
						display={{ base: "none", sm: "inline" }}
					>
						Login Theme
					</Text>
					<ThemeSelectorDialog
						themes={data?.logins || []}
						label="Select Login Theme"
						ThemeTitle="Choose Login Theme"
						isLoading={isLoading}
						apiError={error?.message || ""}
						themeType="login"
					/>
				</Flex>
				<UseAllValues section="login" sections={sections} />
			</Flex>

			{!themeUuid ? (
				<NoThemeSelectedState />
			) : isSchemaLoading || !isHydrated ? (
				// Wait for BOTH the schema AND the saved-draft hydration before
				// mounting the field tree — ColorDrawer's mount-time read of
				// store(id) otherwise locks onto schema defaults when the draft
				// fetch resolves after the schema fetch.
				<LoadingFallback />
			) : schemaError ? (
				<Box p={6}>
					<Text color="red.500">{schemaError.message}</Text>
				</Box>
			) : (
				<SchemaTabs key={currentLocationId} schema={sections} />
			)}
		</>
	);
};

export default LoginTheme;
