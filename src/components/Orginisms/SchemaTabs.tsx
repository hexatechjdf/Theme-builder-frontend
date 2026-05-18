import React, { Profiler, useEffect, useMemo, useState } from "react";
import { Box, Tabs } from "@chakra-ui/react";
import DynamicSection from "./DynamicSection";
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
}

const tabContentAnim = {
	_open: { animationName: "fade-in, scale-in", animationDuration: "300ms" },
	_closed: { animationName: "fade-out, scale-out", animationDuration: "120ms" },
} as const;

const SchemaTabs: React.FC<SchemaTabsProps> = ({
	schema,
	extraTabs = [],
	defaultTabId,
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

	return (
		<Box gap={2} mx={{ base: 0, md: 2 }}>
			<Tabs.Root
				value={activeTab}
				onValueChange={(e) => setActiveTab(e.value)}
				lazyMount
				unmountOnExit={false}
			>
				<Box px={{ base: 2, md: 10 }} my={{ base: 3, md: 5 }}>
					<Tabs.List
						width="100%"
						display="flex"
						flexWrap={{ base: "nowrap", md: "wrap" }}
						overflowX={{ base: "auto", md: "visible" }}
						gap={{ base: 2, md: 1 }}
						pb={{ base: 1, md: 0 }}
						css={{
							"&::-webkit-scrollbar": { height: "4px" },
							"&::-webkit-scrollbar-thumb": {
								background: "rgba(0,0,0,0.2)",
								borderRadius: "2px",
							},
						}}
					>
						{schema.map((s) => (
							<Tabs.Trigger
								key={s.id}
								flexShrink={0}
								value={s.id}
								fontSize={{ base: "xs", md: "sm" }}
								px={{ base: 3, md: 4 }}
							>
								{s.title}
							</Tabs.Trigger>
						))}
						{extraTabs.map((t) => (
							<Tabs.Trigger
								key={t.id}
								flexShrink={0}
								value={t.id}
								fontSize={{ base: "xs", md: "sm" }}
								px={{ base: 3, md: 4 }}
							>
								{t.title}
							</Tabs.Trigger>
						))}
					</Tabs.List>
				</Box>

				{schema.map((section) => (
					<Tabs.Content
						key={section.id}
						value={section.id}
						{...tabContentAnim}
					>
						<Profiler id={`tab:${section.id}`} onRender={onSectionRender}>
							<DynamicSection section={section} />
						</Profiler>
					</Tabs.Content>
				))}

				{extraTabs.map((t) => (
					<Tabs.Content key={t.id} value={t.id} {...tabContentAnim}>
						<Profiler id={`tab:${t.id}`} onRender={onSectionRender}>
							{t.content}
						</Profiler>
					</Tabs.Content>
				))}
			</Tabs.Root>
		</Box>
	);
};

export default SchemaTabs;
