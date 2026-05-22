import { Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { LuLogIn } from "react-icons/lu";
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
import ThemeContentSkeleton from "../Atoms/ThemeContentSkeleton";
import FeedbackState from "../Atoms/FeedbackState";
import PageHeader from "../Molecules/PageHeader";
import StickyActionBar from "../Molecules/StickyActionBar";

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
	// Action toolbar (login-theme picker + Apply Changes) — shown in every
	// state; rides in the sticky zone with the section tabs once a theme loads.
	const toolbar = (
		<Flex
			mx={{ base: 2, md: 6 }}
			mt={{ base: 3, md: 4 }}
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
			<Flex align="center" gap={2.5} minW={0} flex="1">
				<Text
					fontSize="xs"
					color="ink.500"
					textTransform="uppercase"
					letterSpacing="wider"
					fontWeight="bold"
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
	);

	const showTabs =
		!!themeUuid && !isSchemaLoading && isHydrated && !schemaError;

	return (
		<>
			<PageHeader
				icon={<LuLogIn size={22} />}
				title="Login Page Theme"
				description="Style the login screen your users see colors, background, and branding. Saved as a draft until you publish."
			/>

			{showTabs ? (
				<SchemaTabs
					key={currentLocationId}
					schema={sections}
					toolbar={toolbar}
				/>
			) : (
				<>
					<StickyActionBar>{toolbar}</StickyActionBar>
					{!themeUuid ? (
						<NoThemeSelectedState />
					) : isSchemaLoading || !isHydrated ? (
						<ThemeContentSkeleton />
					) : (
						<FeedbackState
							title="Couldn't load this theme"
							description={
								schemaError?.message ||
								"Something went wrong while loading the theme settings. Please try again."
							}
						/>
					)}
				</>
			)}
		</>
	);
};

export default LoginTheme;
