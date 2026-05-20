import { useEffect, useState } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LuCheck } from "react-icons/lu";
import { useRecoilValue } from "recoil";
import { saveActivityAtom } from "../Atoms/saveActivityAtom";
import { lastSavedAtAtom } from "../Atoms/lastSavedAtAtom";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { useChangedList } from "../hooks/useChangedList";
import { formatRelativeTime } from "../utilities/relativeTime";

// Single source of truth for the navbar's edit/save state. Supersedes the
// old PublishStatusBadge — it folds the live/draft signal together with the
// unsaved-edit, in-flight, and "last saved" signals into one calm pill.
//
// State priority (first match wins):
//   1. saving / publishing / reverting  — a mutation is in flight
//   2. unsaved changes                  — edits not yet saved as a draft
//   3. draft saved                      — saved, not yet published live
//   4. all live                         — nothing pending

interface View {
	label: string;
	detail: string; // secondary text ("2 min ago") — hidden on small screens
	pillBg: string;
	pillBorder: string;
	textColor: string;
	dotColor: string;
	pulse: boolean;
	showCheck: boolean;
}

const SaveStatusIndicator = () => {
	const activity = useRecoilValue(saveActivityAtom);
	const publishStatus = useRecoilValue(publishStatusAtom);
	const lastSavedAt = useRecoilValue(lastSavedAtAtom);
	const { count, hasChanges } = useChangedList();

	// Re-render every 30s so "X min ago" stays current without a heavy timer.
	const [, forceTick] = useState(0);
	useEffect(() => {
		const id = setInterval(() => forceTick((n) => n + 1), 30_000);
		return () => clearInterval(id);
	}, []);

	const view: View = (() => {
		const active = {
			pillBg: "whiteAlpha.200",
			pillBorder: "whiteAlpha.300",
			textColor: "white",
		};

		if (activity === "saving")
			return { label: "Saving…", detail: "", dotColor: "#BFDBFE", pulse: true, showCheck: false, ...active };
		if (activity === "publishing")
			return { label: "Publishing…", detail: "", dotColor: "#86EFAC", pulse: true, showCheck: false, ...active };
		if (activity === "reverting")
			return { label: "Reverting…", detail: "", dotColor: "#FCD34D", pulse: true, showCheck: false, ...active };

		if (hasChanges)
			return {
				label: count === 1 ? "1 unsaved change" : `${count} unsaved changes`,
				detail: "",
				pillBg: "#FBBF24",
				pillBorder: "#F59E0B",
				textColor: "#451A03",
				dotColor: "#7C2D12",
				pulse: true,
				showCheck: false,
			};

		if (publishStatus === "draft")
			return {
				label: "Draft saved",
				detail: formatRelativeTime(lastSavedAt),
				dotColor: "#FCD34D",
				pulse: false,
				showCheck: true,
				...active,
			};

		return {
			label: "All changes live",
			detail: "",
			dotColor: "#86EFAC",
			pulse: false,
			showCheck: true,
			...active,
		};
	})();

	const title = view.detail ? `${view.label} · ${view.detail}` : view.label;

	return (
		<HStack
			h="32px"
			gap={1.5}
			px={3}
			borderRadius="full"
			bg={view.pillBg}
			border="1px solid"
			borderColor={view.pillBorder}
			flexShrink={0}
			userSelect="none"
			title={title}
			transition="background-color 0.25s ease, border-color 0.25s ease"
		>
			{view.showCheck ? (
				<Box display="flex" color={view.dotColor} flexShrink={0}>
					<LuCheck size={13} strokeWidth={3} />
				</Box>
			) : (
				<motion.span
					style={{
						width: 8,
						height: 8,
						borderRadius: 999,
						background: view.dotColor,
						display: "block",
						flexShrink: 0,
					}}
					animate={
						view.pulse
							? { scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }
							: { scale: 1, opacity: 1 }
					}
					transition={
						view.pulse
							? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
							: { duration: 0.2 }
					}
				/>
			)}

			<Text
				display={{ base: "none", sm: "block" }}
				fontSize="xs"
				fontWeight="semibold"
				color={view.textColor}
				lineHeight="1"
				whiteSpace="nowrap"
			>
				{view.label}
				{view.detail && (
					<Text
						as="span"
						display={{ base: "none", lg: "inline" }}
						fontWeight="medium"
						opacity={0.7}
					>
						{`  ·  ${view.detail}`}
					</Text>
				)}
			</Text>
		</HStack>
	);
};

export default SaveStatusIndicator;
