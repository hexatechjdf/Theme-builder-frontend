import { useEffect, useState } from "react";
import { Text, Flex } from "@chakra-ui/react";
import { LuLayoutDashboard } from "react-icons/lu";
import { UseAllValues } from "../utilities/GetAllValues";
import Styletabs from "../Layouts/Styletabs";
import ThemeContentSkeleton from "../Atoms/ThemeContentSkeleton";
import NoThemeSelectedState from "../Atoms/NoThemeSelectedState";
import FeedbackState from "../Atoms/FeedbackState";
import PageHeader from "../Molecules/PageHeader";
import StickyActionBar from "../Molecules/StickyActionBar";
import ThemeSelectorDialog from "../Dictionaries/ThemeSelectorDialog";
import useUserTheme from "../services/api";
import { useGetUpdatedUserThemeSetting, useThemeRootSections } from "../services/api";
import { objToCss } from "../utilities/theme";
import { selectedThemeUuidAtom } from "../Atoms/selectedThemeUuid";
import { selectedThemeFamily } from "../Atoms/selectedThemeState";
import { levelModeAtom } from "../Atoms/levelMode";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { customStyleColorValuesSelector } from "../store/selectors";
const Dashboard = () => {

	const { data: defaultThemeData, isLoading: isDefaultLoading, error: defaultError, } = useUserTheme();
	const { data: updatedThemeData, isLoading: isUpdatedLoading, isHydrated, effectiveDraft, error: updatedError, } = useGetUpdatedUserThemeSetting();

	const selectedThemeId = localStorage.getItem("selectedThemeId");
	const draftThemes = updatedThemeData?.themes?.draft || [];

	const selectedDraftTheme = draftThemes.find(
		(theme) => theme.id === selectedThemeId
	);

	const updateThemeValue = selectedDraftTheme ?? draftThemes[0] ?? null;


	const setThemeUuid = useSetRecoilState(selectedThemeUuidAtom);
	// console.log("Current theme_uuid:", selectedThemeUuidAtom);
	useEffect(() => {
		const themeId = defaultThemeData?.dashboards?.[0]?.theme_uuid ?? null;
		setThemeUuid(themeId);
		// console.log("setThemeUuid", selectedThemeUuidAtom)
	}, [defaultThemeData, setThemeUuid]);


	// Per-location selection: each Level Switcher slot has its own pick so
	// switching levels no longer overwrites the other's selection.
	const level = useRecoilValue(levelModeAtom);
	const currentLocationId =
		level.mode === "subaccount"
			? level.subaccountId ?? "agency"
			: "agency";

	const [selectedTheme, setSelectedTheme] = useRecoilState(
		selectedThemeFamily({ themeType: "dashboard", locationId: currentLocationId })
	);

	// Controlled open state for the theme picker — lets the empty-state
	// "Select Theme" button open the same dialog as the toolbar trigger.
	const [pickerOpen, setPickerOpen] = useState(false);

	// Hydrate the per-location atom from the backend's inherited
	// dashboard_id when this slot has never been picked. Without this, a
	// fresh subaccount whose backend draft inherits agency's dashboard_id
	// would render NoThemeSelectedState even though there's a clear
	// fallback theme.
	useEffect(() => {
		if (selectedTheme !== null) return; // user already has a pick for this slot
		if (!isHydrated) return; // wait for the draft fetch so we know what's inherited
		const inheritedId = effectiveDraft?.dashboard_id;
		if (!inheritedId) return;
		const themes = defaultThemeData?.dashboards ?? [];
		const match = themes.find((t) => t.theme_uuid === inheritedId);
		if (match) {
			setSelectedTheme({
				theme_uuid: match.theme_uuid,
				title: match.title,
				image: match.image,
			});
		}
	}, [selectedTheme, isHydrated, effectiveDraft, defaultThemeData, setSelectedTheme]);

	const themeUuid = selectedTheme?.theme_uuid ?? null;
	const {
		sections,
		isLoading: isSchemaLoading,
		error: schemaError,
	} = useThemeRootSections(themeUuid);

	// Remount key on Styletabs — the field tree fully unmounts and re-reads
	// store2 every time the Level Switcher toggles. Without this, switching
	// between two locations that happen to share the same theme uuid keeps
	// the same memoised field components alive — their useEffect deps don't
	// change, so they never re-read the new account's saved values from
	// store2 and the picker stays stuck on the previous account's colors.



	//  effect
	// useEffect(() => {

	// 	const draft = updatedThemeData?.themes?.draft?.[0]?.roots;
	// 	const fallback = defaultThemeData?.dashboards?.[0]?.roots;

	// 	const varsObj = draft ?? fallback;
	// 	if (!varsObj) return;

	// 	const css = objToCss(varsObj);

	// 	let style = document.getElementById('user-theme-style') as HTMLStyleElement;
	// 	if (!style) {
	// 		style = document.createElement('style');
	// 		style.id = 'user-theme-style';
	// 		document.head.appendChild(style);
	// 	}
	// 	style.textContent = css;
	// }, [updatedThemeData, defaultThemeData]);


	// if (isDefaultLoading || isUpdatedLoading) return <LoadingFallback />;

	// if (defaultError || updatedError) {
	// 	return (
	// 		<Box p={6}>
	// 			<Text color="red.500">
	// 				{defaultError?.message || updatedError?.message || "An error occurred."}
	// 			</Text>
	// 		</Box>
	// 	);
	// }

	// Action toolbar (theme picker + Apply Changes). Built once and shown in
	// every state — when a theme is loaded it rides in the sticky zone with
	// the section tabs; otherwise it sits in its own sticky zone so the user
	// can always pick / change a theme.
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
					Theme
				</Text>
				<ThemeSelectorDialog
					themes={defaultThemeData?.dashboards || []}
					label="Select Dashboard Theme"
					ThemeTitle="Choose Dashboard Theme"
					isLoading={isDefaultLoading}
					apiError={defaultError?.message || ""}
					themeType="dashboard"
					open={pickerOpen}
					onOpenChange={setPickerOpen}
				/>
			</Flex>
			<UseAllValues section="theme" sections={sections} />
		</Flex>
	);

	// True only once a theme is picked AND its schema + saved draft are ready
	// — the field tree (and its tabs) can mount. ColorDrawer reads store(id)
	// once on mount, so we wait for hydration before rendering it.
	const showTabs =
		!!themeUuid && !isSchemaLoading && isHydrated && !schemaError;

	return (
		<>
			<PageHeader
				icon={<LuLayoutDashboard size={22} />}
				title="Dashboard Theme"
				description="Customize the colors, fonts, and spacing of your CRM dashboard. Changes are saved as a draft until you publish."
			/>

			{showTabs ? (
				<Styletabs
					key={currentLocationId}
					updatedThemeValue={updateThemeValue}
					schema={sections}
					toolbar={toolbar}
				/>
			) : (
				<>
					<StickyActionBar>{toolbar}</StickyActionBar>
					{!themeUuid ? (
						<NoThemeSelectedState
							onSelectTheme={() => setPickerOpen(true)}
						/>
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

export default Dashboard;



