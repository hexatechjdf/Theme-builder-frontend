import { Box, Flex, Image, Tabs, Text } from "@chakra-ui/react";
import { LuLayoutDashboard } from "react-icons/lu";
import { AiOutlineLogin } from "react-icons/ai";
import { TbLoader3 } from "react-icons/tb";
import { FaCode } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useNavigate, useSearchParams, type To } from "react-router-dom";
import { useEffect, useState } from "react";
import PublishMene from "./PublishMenu";
import Profile from "../Orginisms/Profile";
import LevelSwitcher from "./LevelSwitcher";
import SaveStatusIndicator from "./SaveStatusIndicator";
import { useNavigationGuard } from "../Layouts/NavigationGuard";

type TabValue = "themeCustomize" | "loginTheme" | "loaderAnimations" | "customCss";

const TAB_PATHS: Record<TabValue, string> = {
	themeCustomize: "/dashboard",
	loginTheme: "/LoginTheme",
	loaderAnimations: "/loader",
	customCss: "/custom-css",
};

// Tab metadata — shared by the desktop top tabs and the mobile bottom nav.
// `Icon` is the component (not a rendered node) so each surface can size it.
const TABS: { value: TabValue; label: string; Icon: IconType }[] = [
	{ value: "themeCustomize", label: "Dashboard", Icon: LuLayoutDashboard },
	{ value: "loginTheme", label: "Login Page", Icon: AiOutlineLogin },
	{ value: "loaderAnimations", label: "Loader", Icon: TbLoader3 },
	{ value: "customCss", label: "Custom CSS", Icon: FaCode },
];

const StickyNavbar: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { guardedNavigate } = useNavigationGuard();

	const [selectedTab, setSelectedTab] = useState<TabValue>("themeCustomize");

	// Router target for a tab, preserving the current query string (the GHL
	// iframe passes session context via the URL).
	const targetFor = (tab: TabValue): To => {
		const path = TAB_PATHS[tab] ?? TAB_PATHS.themeCustomize;
		const search = searchParams.toString();
		return { pathname: path, search: search ? `?${search}` : "" };
	};

	// Reflect + persist the active tab — called only once a navigation has
	// actually been committed (see handleTabChange).
	const commitTab = (tab: TabValue) => {
		setSelectedTab(tab);
		localStorage.setItem("selectedTab", tab);
	};

	useEffect(() => {
		const validTabs: TabValue[] = ["themeCustomize", "loginTheme", "loaderAnimations", "customCss"];
		const storedTab = localStorage.getItem("selectedTab") as TabValue;
		const initial: TabValue = validTabs.includes(storedTab) ? storedTab : "themeCustomize";
		setSelectedTab(initial);
		localStorage.setItem("selectedTab", initial);
		// Mount redirect — not a user-initiated "leave", so it bypasses the
		// unsaved-changes guard (changedList is empty on boot anyway).
		navigate(targetFor(initial));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleTabChange = (details: { value: string }) => {
		const value = details.value as TabValue;
		if (value === selectedTab) return;
		// Guard BEFORE touching tab state: Tabs.Root is controlled by
		// `selectedTab`, so if the user cancels the leave the tab stays put.
		// `commitTab` runs only when the navigation is actually committed.
		guardedNavigate(targetFor(value), () => commitTab(value));
	};

	const goHome = () =>
		guardedNavigate(targetFor("themeCustomize"), () =>
			commitTab("themeCustomize"),
		);

	return (
		<>
			<Box
				as="header"
				position="sticky"
				top="0"
				zIndex="800"
				bg="white"
				borderBottom="1px solid"
				borderColor="ink.200"
				boxShadow="0 1px 3px rgba(16, 24, 40, 0.04)"
			>
				{/* Single bar: logo + section nav (lg+) on the left, scope +
				    actions on the right. On small screens the section tabs move
				    to the fixed bottom nav, so they're hidden here. */}
				<Flex
					px={{ base: 2, sm: 3, md: 4, lg: 6 }}
					py={{ base: 2, md: 2.5 }}
					align="center"
					justify="space-between"
					gap={{ base: 1.5, md: 4 }}
				>
					{/* Left cluster — logo + nav tabs (tabs are desktop-only;
					    they move to the bottom nav on small screens). */}
					<Flex align="center" gap={{ base: 2, md: 4 }} minW={0} flex="1">
						<Image
							src="https://msgsndr-private.storage.googleapis.com/companyPhotos/79702884-fc35-45c4-abe7-39720fd41b72.png"
							alt="Theme Builder"
							h={{ base: "26px", md: "36px" }}
							w="auto"
							maxW={{ base: "92px", sm: "120px", md: "170px" }}
							objectFit="contain"
							cursor="pointer"
							onClick={goHome}
							flexShrink={0}
						/>

						<Box
							display={{ base: "none", lg: "block" }}
							minW={0}
							overflowX="auto"
							css={{
								"&::-webkit-scrollbar": { display: "none" },
								scrollbarWidth: "none",
							}}
						>
							<Tabs.Root
								value={selectedTab}
								onValueChange={handleTabChange}
								variant="line"
								colorPalette="brand"
							>
								<Tabs.List borderBottom="none" gap={1}>
									{TABS.map((tab) => (
										<Tabs.Trigger
											key={tab.value}
											value={tab.value}
											flexShrink={0}
											gap={2}
											px={3}
											py={2}
											fontSize="sm"
											fontWeight="semibold"
											color="ink.500"
											_hover={{ color: "ink.800" }}
											_selected={{ color: "brand.600" }}
										>
											<tab.Icon size={17} />
											{tab.label}
										</Tabs.Trigger>
									))}
								</Tabs.List>
							</Tabs.Root>
						</Box>
					</Flex>

					{/* Right cluster — scope (agency/subaccount) + global actions.
					    Allowed to shrink (minW=0) so the subaccount picker inside
					    the LevelSwitcher can truncate; the status / Publish /
					    profile children keep their own flexShrink={0}. */}
					<Flex align="center" gap={{ base: 1, md: 2.5 }} minW={0}>
						<LevelSwitcher />
						<SaveStatusIndicator />
						<PublishMene />
						<Profile />
					</Flex>
				</Flex>
			</Box>

			{/* Mobile bottom navigation — Android-style tab bar. Shown below lg,
			    where the top bar has no room for the section tabs. Fixed to the
			    viewport bottom; MainLayout adds matching bottom padding so
			    content never hides behind it. */}
			<Flex
				as="nav"
				aria-label="Sections"
				display={{ base: "flex", lg: "none" }}
				position="fixed"
				bottom={0}
				left={0}
				right={0}
				zIndex="800"
				bg="white"
				borderTop="1px solid"
				borderColor="ink.200"
				boxShadow="0 -2px 12px rgba(16, 24, 40, 0.08)"
				justify="space-around"
				align="stretch"
			>
				{TABS.map((tab) => {
					const isActive = selectedTab === tab.value;
					return (
						<Box
							as="button"
							key={tab.value}
							onClick={() => handleTabChange({ value: tab.value })}
							aria-label={tab.label}
							aria-current={isActive ? "page" : undefined}
							display="flex"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							gap={1}
							flex="1"
							py={2}
							border="none"
							bg="transparent"
							cursor="pointer"
							color={isActive ? "brand.600" : "ink.500"}
							transition="color 0.15s ease, background-color 0.15s ease"
							_active={{ bg: "ink.100" }}
						>
							<tab.Icon size={20} />
							<Text
								fontSize="10px"
								fontWeight={isActive ? "bold" : "medium"}
								whiteSpace="nowrap"
								lineHeight="1"
							>
								{tab.label}
							</Text>
						</Box>
					);
				})}
			</Flex>
		</>
	);
};

export default StickyNavbar;
