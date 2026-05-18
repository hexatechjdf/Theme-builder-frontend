import { Box, Flex, Tabs, Text } from "@chakra-ui/react";
import { LuLayoutDashboard } from "react-icons/lu";
import { AiOutlineLogin } from "react-icons/ai";
import { TbLoader3 } from "react-icons/tb";
import { FaCode } from "react-icons/fa6";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PublishMene from "./PublishMenu";
import Profile from "../Orginisms/Profile";
import LevelSwitcher from "./LevelSwitcher";
import PublishStatusBadge from "./PublishStatusBadge";


type TabValue = "themeCustomize" | "loginTheme" | "loaderAnimations" | "customCss";

const TAB_PATHS: Record<TabValue, string> = {
	themeCustomize: "/dashboard",
	loginTheme: "/LoginTheme",
	loaderAnimations: "/loader",
	customCss: "/custom-css",
};

const StickyNavbar: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const [selectedTab, setSelectedTab] = useState<TabValue>("themeCustomize");

	const naviagteTabTo = (tab: TabValue) => {
		const path = TAB_PATHS[tab] ?? TAB_PATHS.themeCustomize;
		const search = searchParams.toString();
		navigate({ pathname: path, search: search ? `?${search}` : "" });
	};


	useEffect(() => {
		const validTabs: TabValue[] = ["themeCustomize", "loginTheme", "loaderAnimations", "customCss"];
		const storedTab = localStorage.getItem("selectedTab") as TabValue;
		const initial: TabValue = validTabs.includes(storedTab) ? storedTab : "themeCustomize";
		setSelectedTab(initial);
		localStorage.setItem("selectedTab", initial);
		naviagteTabTo(initial);
	}, []);



	const handleTabChange = (details: { value: TabValue }) => {
		const { value } = details;
		setSelectedTab(value);
		localStorage.setItem("selectedTab", value);
		naviagteTabTo(value)

	};

	return (

		<Box
			position="sticky"
			top="0"
			zIndex="800"
			bg="#735DFF"
			w={["100%", "100%", "100%", "100%"]}
			// minH={"14vh"}
			// display="flex"
			// justifyContent="center"
			alignItems="end"
		>

			<Flex
				width={{ base: "95%", md: "90%" }}
				margin="0 auto"
				pt="14px"
				align="center"
				justify="space-between"
				gap={2}
			>
				<Link to="/dashboard">
					<Text
						fontSize={{ base: "md", md: "xl" }}
						color="white"
						fontWeight="bold"
					>
						Theme Builder
					</Text>
				</Link>
				<Flex gap={{ base: 2, md: 3 }} align="center">
					<Profile />
					<PublishStatusBadge />
					<PublishMene />
				</Flex>
			</Flex>
			<Flex
				as="nav"
				borderRadius="md"
				align="center"
				w={["95%", "92%", "90%", "90%"]}
				minH={["4vh", "4vh", "8vh", "8vh"]}
				margin="0 auto"
				bg="white"
				position="relative"
				transform="translateY(35%)"
				boxShadow="md"
				justify="space-between"
				gap={{ base: 2, md: 4 }}
				flexWrap="nowrap"
				px={{ base: 3, md: 6 }}
				py={{ base: 2, md: 0 }}
			>
				<LevelSwitcher />
				{/*
				  Tabs container takes the remaining space (flex=1) and is allowed
				  to shrink past its content size (minW=0). If the LevelSwitcher
				  becomes wide (e.g. subaccount picker pill is visible) and the
				  combined width exceeds the navbar, the tabs scroll horizontally
				  instead of wrapping to a new line. Scrollbar is hidden for a
				  clean look — trackpad/touch scrolling still works.
				*/}
				<Box
					flex="1"
					minW={0}
					overflowX="auto"
					css={{
						"&::-webkit-scrollbar": { display: "none" },
						"scrollbarWidth": "none",
					}}
				>
					<Tabs.Root
						value={selectedTab}
						variant={"subtle"}
						style={{
							border: "none",
							boxShadow: "none",
						}}
						onValueChange={handleTabChange}
					>
						<Tabs.List>
							<Tabs.Trigger
								_selected={{ bg: "blackAlpha.800", color: "white" }}
								borderRadius={"md"}
								px={{ base: 3, md: 4, lg: 5 }}
								py={{ base: 3, md: 4 }}
								fontSize={{ base: "sm", md: "md" }}
								value="themeCustomize"
								flexShrink={0}
							>
								<LuLayoutDashboard />
								<Box display={{ base: "none", lg: "block" }}>
									Theme Customize
								</Box>
							</Tabs.Trigger>
							<Tabs.Trigger
								_selected={{ bg: "blackAlpha.800", color: "white" }}
								borderRadius={"md"}
								px={{ base: 3, md: 4, lg: 5 }}
								py={{ base: 3, md: 4 }}
								fontSize={{ base: "sm", md: "md" }}
								value="loginTheme"
								flexShrink={0}
							>
								<AiOutlineLogin />
								<Box display={{ base: "none", lg: "block" }}>
									Login Theme
								</Box>
							</Tabs.Trigger>
							<Tabs.Trigger
								_selected={{ bg: "blackAlpha.800", color: "white" }}
								borderRadius={"md"}
								px={{ base: 3, md: 4, lg: 5 }}
								py={{ base: 3, md: 4 }}
								fontSize={{ base: "sm", md: "md" }}
								value="loaderAnimations"
								flexShrink={0}
							>
								<TbLoader3 />
								<Box display={{ base: "none", lg: "block" }}>
									Loader Animations
								</Box>
							</Tabs.Trigger>
							<Tabs.Trigger
								_selected={{ bg: "blackAlpha.800", color: "white" }}
								borderRadius={"md"}
								px={{ base: 3, md: 4, lg: 5 }}
								py={{ base: 3, md: 4 }}
								fontSize={{ base: "sm", md: "md" }}
								value="customCss"
								flexShrink={0}
							>
								<FaCode />
								<Box display={{ base: "none", lg: "block" }}>
									Custom CSS
								</Box>
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				</Box>

			</Flex>
		</Box>
	);
};

export default StickyNavbar;
