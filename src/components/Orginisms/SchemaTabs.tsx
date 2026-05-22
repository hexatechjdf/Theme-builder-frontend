import React, { Profiler, useEffect, useMemo, useState } from "react";
import { Flex, Tabs } from "@chakra-ui/react";
import DynamicSection from "./DynamicSection";
import StickyActionBar from "../Molecules/StickyActionBar";
import type { SchemaSection } from "../Dictionaries/themeSchema";

// Toggle to false to silence timing logs in production. Cheap when off.
const PERF_LOG = true;

const onSectionRender = (
	id: string,
	phase: "mount" | "update" | "nested-update",
	actualDuration: number
) => {
	if (!PERF_LOG) return;
	const tag = phase === "mount" ? "🟢 mount" : phase === "update" ? "🟡 update" : "🔵 nested";
	// Filter out tiny updates (< 1ms) so the console isn't flooded.
	if (actualDuration < 1 && phase !== "mount") return;
	console.log(`[Profiler] ${tag} ${id} → ${actualDuration.toFixed(1)}ms`);
};

export interface ExtraTab {
	id: string;
	title: string;
	content: React.ReactNode;
}

interface SchemaTabsProps {
	schema: SchemaSection[];
	extraTabs?: ExtraTab[];
	defaultTabId?: string;
	// Optional action toolbar (theme picker + Apply Changes) rendered inside
	// the same sticky zone as the section tabs, so both stay visible while
	// the user scrolls the field grid.
	toolbar?: React.ReactNode;
}

// Smooth, plain cross-fade for the active section. The previous
// `scale-in/scale-out` made the whole card visibly zoom, and animating the
// EXIT kept the outgoing panel laid out for a beat — together that read as a
// glitchy jump. A single gentle fade-in on the incoming panel is clean.
const tabContentAnim = {
	_open: {
		animationName: "fade-in",
		animationDuration: "200ms",
		animationTimingFunction: "ease",
	},
} as const;

// Shared trigger styling — a segmented "pill" control so the available
// sections, and which one is active, are unmistakable.
const triggerStyle = {
	flexShrink: 0,
	px: { base: 3, md: 4.5 },
	py: { base: 1.5, md: 2 },
	borderRadius: "8px",
	fontSize: { base: "xs", md: "sm" },
	fontWeight: "semibold",
	color: "ink.500",
	whiteSpace: "nowrap",
	transition: "color 0.15s ease, background-color 0.15s ease",
	_hover: { color: "ink.800", bg: "ink.100" },
	_selected: {
		bg: "brand.600",
		color: "white",
		boxShadow: "0 2px 8px -1px rgba(79, 70, 229, 0.5)",
		// Flat bottom so the active tab visually attaches to the section
		// card sitting directly underneath it.
		borderBottomRadius: 0,
	},
} as const;

const SchemaTabs: React.FC<SchemaTabsProps> = ({
	schema,
	extraTabs = [],
	defaultTabId,
	toolbar,
}) => {
	// All valid tab ids in render order — schema tabs first, then extras.
	const validIds = useMemo(
		() => [...schema.map((s) => s.id), ...extraTabs.map((t) => t.id)],
		[schema, extraTabs]
	);
	const firstTab = defaultTabId ?? validIds[0] ?? "";

	// Controlled active tab. `defaultValue` alone wasn't enough — when the
	// schema arrives async (theme picked after mount) or when the user switches
	// themes, Tabs.Root's initial-mount-only `defaultValue` would not retarget
	// to the new schema's first id, leaving the content area blank until the
	// user manually clicked a tab.
	const [activeTab, setActiveTab] = useState(firstTab);

	useEffect(() => {
		// If the active tab disappeared (e.g. user switched themes and the new
		// schema has different section ids), reset to the first valid tab.
		if (!activeTab || !validIds.includes(activeTab)) {
			if (firstTab) setActiveTab(firstTab);
		}
	}, [validIds, firstTab, activeTab]);

	if (!firstTab) return null;

	// Only show the tab switcher when there's more than one section — a
	// single-section theme (e.g. just "Base Style") has nothing to switch
	// between, so the lone tab is noise.
	const showTabList = validIds.length > 1;

	return (
		<Tabs.Root
			value={activeTab}
			onValueChange={(e) => setActiveTab(e.value)}
			variant="plain"
			lazyMount
			unmountOnExit={false}
		>
			{/* Sticky zone — action toolbar + section switcher stay pinned so
			    the user can always reach them while scrolling the grid. When the
			    tab bar is shown, pb=0 so the tabs sit flush on the card; when it
			    isn't, the default gap keeps the toolbar off the card. */}
			<StickyActionBar pb={showTabList ? 0 : undefined}>
				{toolbar}
				{showTabList && (
				<Flex
					justify="flex-start"
					px={{ base: 2, md: 6 }}
					mt={toolbar ? { base: 1, md: 2 } : { base: 1, md: 1 }}
					overflowX="auto"
					css={{
						"&::-webkit-scrollbar": { height: "0px" },
						scrollbarWidth: "none",
					}}
				>
					<Tabs.List
						display="inline-flex"
						gap={1}
						bg="white"
						border="1px solid"
						borderColor="ink.300"
						borderBottomWidth={0}
						borderRadius="11px 11px 0 0"
						pt="4px"
						px="4px"
						pb={0}
						boxShadow="0 -1px 4px -1px rgba(16, 24, 40, 0.08)"
					>
						{schema.map((s) => (
							<Tabs.Trigger key={s.id} value={s.id} {...triggerStyle}>
								{s.title}
							</Tabs.Trigger>
						))}
						{extraTabs.map((t) => (
							<Tabs.Trigger key={t.id} value={t.id} {...triggerStyle}>
								{t.title}
							</Tabs.Trigger>
						))}
					</Tabs.List>
				</Flex>
				)}
			</StickyActionBar>

			{schema.map((section) => (
				<Tabs.Content
					key={section.id}
					value={section.id}
					p={0}
					{...tabContentAnim}
				>
					<Profiler id={`tab:${section.id}`} onRender={onSectionRender}>
						<DynamicSection section={section} attachedTop={showTabList} />
					</Profiler>
				</Tabs.Content>
			))}

			{extraTabs.map((t) => (
				<Tabs.Content key={t.id} value={t.id} p={0} {...tabContentAnim}>
					<Profiler id={`tab:${t.id}`} onRender={onSectionRender}>
						{t.content}
					</Profiler>
				</Tabs.Content>
			))}
		</Tabs.Root>
	);
};

export default SchemaTabs;
