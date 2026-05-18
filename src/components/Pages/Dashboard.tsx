import { useEffect } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import ThemePresetMenu from "../Atoms/ThemePresetMenu";
import { UseAllValues } from "../utilities/GetAllValues";
import Styletabs from "../Layouts/Styletabs";
import LoadingFallback from "../Atoms/LoadingFallbackSpinner";
import NoThemeSelectedState from "../Atoms/NoThemeSelectedState";
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

	return (
		<>
			{/*
			  Compact sticky action bar. Replaces the previous Card.Root header
			  which used p={6} + a stacked title row and ate a chunk of vertical
			  space. The picker + Apply Changes sit on a single line; on small
			  screens they stack. Sticks to the top of the scroll container so
			  the user can always reach Apply Changes without scrolling back up.
			*/}
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
						Theme
					</Text>
					<ThemeSelectorDialog
						themes={defaultThemeData?.dashboards || []}
						label="Select Dashboard Theme"
						ThemeTitle="Choose Dashboard Theme"
						isLoading={isDefaultLoading}
						apiError={defaultError?.message || ""}
						themeType="dashboard"
					/>
				</Flex>
				<UseAllValues section="theme" sections={sections} />
			</Flex>

			{!themeUuid ? (
				<NoThemeSelectedState />
			) : isSchemaLoading || !isHydrated ? (
				// Wait for BOTH the schema AND the saved-draft hydration before
				// mounting the field tree. ColorDrawer reads store(id) once on
				// mount, so if it mounts while only the schema has been written,
				// the picker locks onto the default rgb and never picks up the
				// saved value when it lands a beat later.
				<LoadingFallback />
			) : schemaError ? (
				<Box p={6}>
					<Text color="red.500">{schemaError.message}</Text>
				</Box>
			) : (
				<Styletabs
					key={currentLocationId}
					updatedThemeValue={updateThemeValue}
					schema={sections}
				/>
			)}
		</>
	);
};

export default Dashboard;



