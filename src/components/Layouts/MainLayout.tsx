import { Box } from "@chakra-ui/react";
import StickyNavbar from "../Molecules/Navbar";
import GetUserCustomTheme from "../utilities/getUserTheme";
import DraftHydrator from "../DraftHydrator";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<Box h="100vh" display="flex" flexDirection="column">
			<StickyNavbar />

			<Box
				px={{ base: 2, sm: 4, md: 8, lg: 12 }}
				py={{ base: 4, md: 8, lg: 12 }}
				mt={4}
				w="100%"
				overflowY="auto"
			>
				{children}
			</Box>

			<GetUserCustomTheme />
			<DraftHydrator />
		</Box>
	);
};

export default MainLayout;
