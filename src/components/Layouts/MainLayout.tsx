import { Fragment } from "react";
import { Box } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import StickyNavbar from "../Molecules/Navbar";
import GetUserCustomTheme from "../utilities/getUserTheme";
import DraftHydrator from "../DraftHydrator";
import { NavigationGuardProvider } from "./NavigationGuard";
import { revertNonceAtom } from "../Atoms/revertNonceAtom";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	// Bumped by a successful Revert (see PublishMenu). Used as a `key` below
	// to hard-remount the theme content so every field re-reads the reverted
	// draft from store2 — applying the revert with no full page reload.
	const revertNonce = useRecoilValue(revertNonceAtom);

	return (
		// NavigationGuardProvider wraps the navbar + page so both the navbar's
		// guarded tab navigation and the leave-confirmation modal share one
		// context. It must sit inside the router (it uses `useNavigate`) —
		// MainLayout already renders inside <Routes>.
		<NavigationGuardProvider>
			<Box h="100vh" display="flex" flexDirection="column">
				<StickyNavbar />

				{/*
				  Keyed on `revertNonce` so a successful Revert hard-remounts the
				  whole theme-content subtree — the page, the theme hydrator, and
				  the :root painter. Mounted field components (ColorDrawer, etc.)
				  read store2 only once on mount; remounting is what forces them
				  to pick up the reverted values without a page reload. The
				  navbar stays outside this Fragment so it isn't disturbed.
				*/}
				<Fragment key={revertNonce}>
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
				</Fragment>
			</Box>
		</NavigationGuardProvider>
	);
};

export default MainLayout;
