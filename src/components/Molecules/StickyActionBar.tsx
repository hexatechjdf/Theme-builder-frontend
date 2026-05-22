import { Box, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface StickyActionBarProps {
	children: ReactNode;
	// Bottom padding = the gap before the content below. Defaults to a small
	// gap so the toolbar doesn't sit flush against the card. SchemaTabs passes
	// 0 when the tab bar is shown, so the tabs sit flush ON the section card
	// (the attached-tabs look).
	pb?: BoxProps["pb"];
}

/*
 * Sticky header zone for workspace pages — holds the action toolbar (theme
 * picker + Apply Changes) and, when present, the section tabs.
 *
 * It is a full-width band painted in the CANVAS colour. That's the fix for
 * the earlier overlap: the toolbar itself can stay inset (its own `mx`), while
 * this opaque canvas-coloured band fully covers any content scrolling beneath
 * it — the band blends seamlessly with the page so nothing looks "off".
 */
const StickyActionBar: React.FC<StickyActionBarProps> = ({ children, pb }) => {
	return (
		<Box
			position="sticky"
			top={0}
			zIndex={20}
			bg="#e2e4ec"
			pb={pb ?? { base: 2, md: 3 }}
		>
			{children}
		</Box>
	);
};

export default StickyActionBar;
