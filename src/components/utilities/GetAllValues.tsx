import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Dialog, Flex, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import { LuTriangleAlert, LuUndo2 } from "react-icons/lu";
import { Button } from "../ui/button";
import { CloseButton } from "../ui/close-button";
import store from "store2";
import { usePostThemeSetting, usePublishThemeToLive } from "../services/api";
import type { DraftThemeResponse } from "../services/api";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { selectedThemeFamily } from "../Atoms/selectedThemeState";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { saveActivityAtom } from "../Atoms/saveActivityAtom";
import { lastSavedAtAtom } from "../Atoms/lastSavedAtAtom";
import { levelModeAtom } from "../Atoms/levelMode";
import { useChangedList } from "../hooks/useChangedList";
import { notifyChangedListChanged } from "../store/changedListStore";
import { registerSaver } from "../store/saveBus";
import { clearFieldCache } from "./clearFieldCache";
import { revertNonceAtom } from "../Atoms/revertNonceAtom";
import { normalizeToFormat, wrapWithFormat } from "./formatColor";
import type { SchemaField, SchemaSection } from "../Dictionaries/themeSchema";
import {
	buildDependencyGraph,
	findFieldByKey,
	isFieldLinked,
	linkedExpressionFor,
	parentKeysFromBaseRoot,
} from "./variableLinks";
import { notifyRoots, writeRoot } from "./rootsLive";
import LinkPropagationDialog, {
	type LinkPropagationGroup,
} from "../Molecules/LinkPropagationDialog";

type SettingSection = "theme" | "login" | "loader";

interface UseAllValuesProps {
	// Tells the backend which slot is being saved. CustomCss has its own inline
	// save flow that sends `section: "custom_css"` directly.
	section: SettingSection;
	// Theme & login sections pass their schema sections so the save payload
	// can carry ALL visible field values (not just keys in `changedList`),
	// each normalized to its declared format. Loader section doesn't use roots.
	sections?: SchemaSection[];
}

// Substitute `var(--key)` references in the child's linked expression with
// the parent's SAVED literal (read from the cached draft). Used for the
// "detach" branch in the propagation popup — the child stops cascading and
// freezes at the colour it was just BEFORE the parent edit.
const VAR_REF = /var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g;
const computeDetachedValue = (
	child: SchemaField,
	savedRoots: Record<string, string>
): string => {
	const linked = linkedExpressionFor(child);
	if (!linked) return "";
	return linked.replace(VAR_REF, (match, key) => {
		const saved = savedRoots[key];
		return typeof saved === "string" && saved.trim() ? saved : match;
	});
};

export const UseAllValues = ({ section, sections }: UseAllValuesProps) => {
	/* ─────── RECOIL ─────── */
	const level = useRecoilValue(levelModeAtom);
	const locationId =
		level.mode === "subaccount" ? level.subaccountId ?? "agency" : "agency";
	// selectedThemeFamily is keyed per location, so saves use whichever theme
	// the user picked at the CURRENT level — agency's pick does not silently
	// override a subaccount's pick (and vice versa).
	const dashboardTheme = useRecoilValue(
		selectedThemeFamily({ themeType: "dashboard", locationId })
	);
	const loginTheme = useRecoilValue(
		selectedThemeFamily({ themeType: "login", locationId })
	);

	/* ─────── React‑Query ─────── */
	const { mutate, isLoading } = usePostThemeSetting();
	const revertMutation = usePublishThemeToLive();
	const queryClient = useQueryClient();
	const [publishStatus, setPublishStatus] = useRecoilState(publishStatusAtom);
	const setSaveActivity = useSetRecoilState(saveActivityAtom);
	const setLastSavedAt = useSetRecoilState(lastSavedAtAtom);
	const setRevertNonce = useSetRecoilState(revertNonceAtom);
	const [isReverting, setIsReverting] = useState(false);
	// Confirmation gate for Revert — discarding the draft is destructive and
	// can't be undone, so we make the user confirm before it fires.
	const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
	// Reactive view of `changedList` — drives the save button's enabled state.
	const { hasChanges } = useChangedList();

	/* ─────── Link-propagation dialog state ─────── */
	const [dialogOpen, setDialogOpen] = useState(false);
	const [pendingGroups, setPendingGroups] = useState<LinkPropagationGroup[]>([]);
	// When the propagation dialog opens, the postValue Promise is left
	// pending here until the user confirms (resolves with the mutation
	// outcome) or cancels (resolves false). Lets callers like PublishMenu
	// await the full Apply-Changes flow including the user decision.
	const pendingResolveRef = useRef<((v: boolean) => void) | null>(null);
	// Carries the `silent` flag across the propagation dialog so the save
	// that runs on confirm still suppresses the "draft saved" toast when it
	// was started by the publish auto-save chain.
	const pendingSilentRef = useRef(false);

	// Read the SAVED roots for the current section out of the react-query
	// cache. This is the pre-edit picture of theme/login_roots — used both
	// to look up old parent literals when detaching and to build the
	// "previewColor" swatch in the propagation popup.
	const getSavedRootsForSection = (): Record<string, string> => {
		const cached = queryClient.getQueryData<DraftThemeResponse>([
			"updatedUserThemeSetting",
			locationId,
		]);
		const draft = cached?.themes?.draft?.[0];
		if (!draft) return {};
		const key = section === "login" ? "login_roots" : "theme_roots";
		const roots = draft[key];
		if (!roots || Array.isArray(roots)) return {};
		return roots;
	};

	// Build the `roots` object for a theme/login save.
	//
	// Per backend contract: send the CURRENT value for EVERY field in the
	// schema, regardless of `enabled`. Disabled fields are only hidden from
	// the picker UI — they still need to round-trip through the backend so
	// the schema stays complete on re-fetch. Each colour value is normalised
	// to the format the schema declares (raw tuple for rgb/hsl, hex for hex,
	// full CSS filter chain for filter).
	const buildRoots = (): Record<string, string> => {
		const out: Record<string, string> = {};
		if (!sections || sections.length === 0) return out;
		sections.forEach((sec) => {
			sec.fields.forEach((field) => {
				if (!field?.key) return;
				// Read the current value — user's edit if any, else the schema
				// default seeded by useThemeRootSections.
				const raw = store(field.key) ?? field.defaultValue;
				const cleaned =
					typeof raw === "string"
						? raw.replace(/^"(.*)"$/, "$1")
						: raw;
				if (cleaned === undefined || cleaned === null || cleaned === "")
					return;
				const value = String(cleaned);

				// `valueMode: "cssVar"` is a backend-authored CSS expression
				// (var(...), linear-gradient(...), etc.) — pass through with
				// no normalisation, no url() wrapping.
				if (field.valueMode === "cssVar") {
					out[field.key] = value;
					return;
				}

				// `type: "url"` — wrap as `url("…")` for the wire so admin CSS
				// can drop it straight into a `background-image: var(--logo)`
				// or similar. Skip wrapping if it's already wrapped.
				if (field.type === "url") {
					out[field.key] = /^url\(/i.test(value.trim())
						? value
						: `url("${value}")`;
					return;
				}

				// Colour fields go through format normalisation.
				if (field.type === "color") {
					const normalised = normalizeToFormat(value, field.format);
					if (normalised) out[field.key] = normalised;
					return;
				}

				// Everything else (text, number, select, fonts, spacing) is
				// passed through verbatim.
				out[field.key] = value;
			});
		});
		return out;
	};

	// Run the actual POST. Split out so the dialog confirm-handler can call
	// it AFTER applying its decisions to store2.
	//
	// Returns a Promise that resolves to `true` on a successful save and
	// `false` on error — so callers (Apply Changes button, Publish menu's
	// auto-save) can chain follow-up work on the actual outcome instead of
	// firing and forgetting.
	const runMutation = async (opts?: { silent?: boolean }): Promise<boolean> => {
		let payload: any;

		if (section === "theme") {
			payload = {
				section: "theme",
				type: "draft",
				locationId,
				theme_id: dashboardTheme?.theme_uuid ?? "",
				roots: buildRoots(),
			};
		} else if (section === "login") {
			payload = {
				section: "login",
				type: "draft",
				locationId,
				login_id: loginTheme?.theme_uuid ?? "",
				roots: buildRoots(),
			};
		} else {
			// loader
			const loaderId = store("animation");
			if (!loaderId) {
				toast.warning("Pick a loader before saving");
				return false;
			}
			payload = {
				section: "loader",
				type: "draft",
				locationId,
				loader_id: loaderId,
			};
		}

		setSaveActivity("saving");
		// react-query's `mutate` is fire-and-forget (only signals via
		// callbacks). Wrap it in a Promise so callers can await the
		// real outcome.
		return new Promise<boolean>((resolve) => {
			try {
				mutate(payload, {
					onSuccess: () => {
						// Suppress the "draft saved" toast when this save is part
						// of the publish auto-save chain — PublishMenu shows its
						// own "published" toast, and "Click Publish to push live"
						// would contradict the publish that's already happening.
						if (!opts?.silent) {
							toast.success(
								"Saved as draft. Click Publish to push live"
							);
						}
						store("changedList", []);
						// Push the cleared list to subscribers (navbar indicator,
						// leave-guard, save button) without waiting for the poll.
						notifyChangedListChanged();
						setLastSavedAt(Date.now());
						setPublishStatus("draft");
						// Invalidate every variant — react-query treats keys as a
						// prefix match when you pass the partial key, so this also
						// hits ["updatedUserThemeSetting", "<locationId>"].
						queryClient.invalidateQueries(["updatedUserThemeSetting"]);
						resolve(true);
					},
					onError: (error) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Failed to update theme. Please try again."
						);
						resolve(false);
					},
					onSettled: () => {
						setSaveActivity("idle");
					},
				});
			} catch (err) {
				setSaveActivity("idle");
				toast.error("An unexpected error occurred");
				console.error("Error posting theme:", err);
				resolve(false);
			}
		});
	};

	const postValue = async (opts?: { silent?: boolean }): Promise<boolean> => {
		const changedList: string[] = store("changedList") || [];

		// Theme / login require user changes; loader is gated on whether a
		// loader has been picked at all.
		if (section === "theme" || section === "login") {
			if (changedList.length === 0) {
				if (!opts?.silent) {
					toast.warning("You have not changed any values");
				}
				// Nothing to save → clean no-op (publish auto-save treats
				// this as success and continues straight to publish).
				return true;
			}
		}

		// Loader doesn't carry roots → no link propagation possible.
		if (section === "loader") {
			return runMutation(opts);
		}

		// Build the dependency graph from THIS section's schema only — links
		// don't cross theme/login namespaces.
		const graph = buildDependencyGraph(sections);

		// Snapshot the saved (pre-edit) draft from the react-query cache so each
		// child row can render a "was → will be" visualization. We read this
		// once here at popup-open time AND again inside handleConfirm; both
		// reads hit the same cache. If the cache is empty (very first save in
		// a session), oldColor falls back to the child's own current literal.
		const savedRoots = getSavedRootsForSection();

		// For each changed key that's a parent of one or more children, build
		// a group for the propagation popup. Skip parents that don't have any
		// linkable children.
		const groups: LinkPropagationGroup[] = [];
		changedList.forEach((parentKey) => {
			const children = graph.get(parentKey);
			if (!children || children.length === 0) return;

			const parentField = findFieldByKey(sections, parentKey);
			const parentLabel = parentField?.label ?? parentKey;
			const parentFormat =
				parentField && parentField.type === "color" ? parentField.format : undefined;
			const parentNewRaw = String(store(parentKey) ?? "");
			const parentOldRaw = String(savedRoots[parentKey] ?? "");
			// Browser-renderable forms for the swatches in the popup. Raw stored
			// values are tuples like "70, 95, 215" per the backend wire format;
			// wrap them with the parent's declared format so `style.background`
			// can paint them.
			const parentNewColor = wrapWithFormat(parentNewRaw, parentFormat);
			const parentOldColor = wrapWithFormat(parentOldRaw, parentFormat);

			// Hide disabled children from the popup. They stay tracked in the
			// dependency graph (so the relationship is still in the loop for a
			// later phase that exposes them), but for now an admin-disabled
			// field shouldn't appear as a checkbox row.
			const visibleChildren = children.filter((c) => c.enabled !== false);
			if (visibleChildren.length === 0) return;

			const childRows = visibleChildren.map((child) => {
				const currentVal = store(child.key) as string | undefined;
				const wasLinked = isFieldLinked(child, currentVal);
				const childFormat =
					child.type === "color" ? child.format : undefined;
				return {
					field: child,
					initiallyLinked: wasLinked,
					// Left swatch: what the variable currently displays. For an
					// initially-linked child that's the parent's OLD literal (the
					// child was resolving `var(--parent)` against the saved
					// parent value before the user changed it). For an
					// initially-detached child it's the child's own literal.
					oldColor: wasLinked
						? parentOldColor || parentNewColor
						: wrapWithFormat(String(currentVal ?? ""), childFormat),
					// Right swatch: what it'll become if kept linked — the
					// parent's NEW colour.
					newColor: parentNewColor,
				};
			});

			groups.push({
				parentKey,
				parentLabel,
				parentNewColor,
				children: childRows,
			});
		});

		if (groups.length === 0) {
			// No parent-with-children edits — fall through to the existing
			// save flow.
			return runMutation(opts);
		}

		// Otherwise: open the popup. The confirm-handler will apply the
		// chosen link/detach state to store2, then run the mutation.
		// The returned Promise stays pending until the user resolves the
		// dialog via handleConfirm / handleCancel.
		return new Promise<boolean>((resolve) => {
			pendingResolveRef.current = resolve;
			pendingSilentRef.current = opts?.silent ?? false;
			setPendingGroups(groups);
			setDialogOpen(true);
		});
	};

	const handleConfirm = async (decisions: Record<string, boolean>) => {
		const savedRoots = getSavedRootsForSection();

		// Apply each decision to both store2 (canonical, what gets saved) AND
		// `:root` (visual, what the cascade + our pickers resolve against).
		// `applyThemeRoots` paints linked children as frozen literals so the
		// parent-edit cascade is intentionally blocked — we have to update
		// the child's `:root` value here by hand, on the user's explicit OK.
		Object.entries(decisions).forEach(([childKey, linkedNow]) => {
			const child = findFieldByKey(sections, childKey);
			if (!child) return;
			const wasLinked = isFieldLinked(
				child,
				store(childKey) as string | undefined
			);

			if (linkedNow) {
				// Result: child is/becomes linked. store2 keeps `var(--parent)` so
				// the save payload preserves the link. `:root` gets the NEW parent
				// literal so this session reflects the kept cascade.
				if (!wasLinked) {
					const expr = linkedExpressionFor(child);
					if (expr) store(childKey, expr);
				}
				const [parentKey] = parentKeysFromBaseRoot(child.baseRoot ?? "");
				if (parentKey && typeof document !== "undefined") {
					const newParentRaw = store(parentKey);
					if (typeof newParentRaw === "string" && newParentRaw) {
						document.documentElement.style.setProperty(
							childKey,
							newParentRaw
						);
					}
				}
			} else if (wasLinked) {
				// Detach: freeze the child at the OLD parent literal (read from
				// the SAVED draft cache, NOT the new parent currently in store2).
				// `writeRoot` lands the same literal in both store2 and `:root`.
				const literal = computeDetachedValue(child, savedRoots);
				if (literal) writeRoot(childKey, literal);
			}
			// else: not linked, stays not linked → no-op
		});

		// Bus tick — every ColorDrawer mount effect subscribed via
		// `useRootsVersion` re-fires, re-resolves any `var(--parent)` from
		// store2, and pushes the literal into Recoil so the picker swatch
		// updates. Without this the swatches stay frozen until reload.
		notifyRoots();

		setDialogOpen(false);
		setPendingGroups([]);

		const success = await runMutation({ silent: pendingSilentRef.current });
		// Resolve the deferred postValue Promise so any awaiting caller
		// (Publish menu's auto-save) sees the real outcome.
		const resolve = pendingResolveRef.current;
		pendingResolveRef.current = null;
		pendingSilentRef.current = false;
		resolve?.(success);
	};

	const handleCancel = () => {
		setDialogOpen(false);
		setPendingGroups([]);
		// User cancelled the propagation decision → treat the deferred
		// postValue Promise as a cancelled save so PublishMenu aborts
		// the publish chain.
		const resolve = pendingResolveRef.current;
		pendingResolveRef.current = null;
		pendingSilentRef.current = false;
		resolve?.(false);
	};

	// Register this page's saver on the global bus so the navbar's Publish
	// button can run Apply Changes (with the link-propagation dialog if
	// needed) before publishing. Uses a ref-of-latest-callback so the
	// registered wrapper always sees current closures without re-binding
	// the registration on every render.
	const postValueRef = useRef(postValue);
	useEffect(() => {
		postValueRef.current = postValue;
	});
	useEffect(() => {
		registerSaver(() => postValueRef.current({ silent: true }));
		return () => {
			registerSaver(null);
			// If we unmount mid-dialog, resolve the awaiting auto-save as
			// cancelled so PublishMenu's await doesn't hang forever.
			pendingResolveRef.current?.(false);
			pendingResolveRef.current = null;
		};
	}, []);

	// Theme/Login saves require at least one edit. The loader save is gated
	// separately (on whether a loader is picked) inside runMutation, so its
	// button must stay enabled even with an empty changedList.
	const cleanDisabled =
		(section === "theme" || section === "login") && !hasChanges;

	// Revert: discard the current draft and restore the live (published)
	// version. Rewrites draft←live server-side, refetches, clears the field
	// cache and bumps revertNonce so MainLayout remounts the field tree and
	// every field re-reads the reverted values without a page reload.
	const handleRevert = () => {
		const payload = { from: "live", to: "draft", locationId };
		setIsReverting(true);
		setSaveActivity("reverting");
		revertMutation.mutate(payload as any, {
			onSuccess: async () => {
				try {
					await queryClient.invalidateQueries([
						"updatedUserThemeSetting",
					]);
				} catch {
					/* a refetch hiccup shouldn't block the reset + remount */
				}
				clearFieldCache();
				notifyChangedListChanged();
				setRevertNonce((n) => n + 1);
				toast.success("Changes reverted to the published version");
				// Draft now matches live → nothing pending.
				setPublishStatus("live");
			},
			onError: (err: any) => {
				toast.warn(
					err?.response?.data?.message ||
						err?.message ||
						"Failed to revert. Please try again."
				);
			},
			onSettled: () => {
				setIsReverting(false);
				setSaveActivity("idle");
			},
		});
	};

	// Nothing to revert when the draft already matches live (publishStatus
	// "live") and there are no unsaved edits.
	const revertDisabled = publishStatus !== "draft" && !hasChanges;

	// Fired by the warning dialog's confirm button — close the dialog, then
	// run the actual revert.
	const confirmRevert = () => {
		setRevertConfirmOpen(false);
		handleRevert();
	};

	return (
		<>
			<HStack gap={2} flexShrink={0}>
				<Button
					onClick={() => setRevertConfirmOpen(true)}
					size="sm"
					h="32px"
					minH="32px"
					px={{ base: 2.5, md: 3 }}
					fontSize="xs"
					variant="outline"
					borderRadius="lg"
					fontWeight="semibold"
					color="ink.600"
					borderColor="ink.300"
					bg="white"
					_hover={{ bg: "ink.100", borderColor: "ink.400" }}
					loading={isReverting}
					loadingText="Reverting…"
					disabled={revertDisabled}
					gap={1.5}
					title={
						revertDisabled
							? "Nothing to revert — the draft matches what's live"
							: "Revert to the published version"
					}
				>
					<LuUndo2 size={14} />
					Revert
				</Button>
				<Button
					onClick={() => postValue()}
					size="sm"
					h="32px"
					minH="32px"
					px={{ base: 3, md: 3.5 }}
					fontSize="xs"
					colorPalette="brand"
					borderRadius="lg"
					fontWeight="semibold"
					loading={isLoading}
					loadingText="Saving…"
					disabled={cleanDisabled}
					transition="opacity 0.2s ease, background-color 0.2s ease"
					title={
						cleanDisabled ? "Make a change to enable saving" : undefined
					}
				>
					Apply Changes
				</Button>
			</HStack>
			<LinkPropagationDialog
				open={dialogOpen}
				groups={pendingGroups}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>

			<Dialog.Root
				open={revertConfirmOpen}
				onOpenChange={(d) => setRevertConfirmOpen(d.open)}
				placement="center"
				motionPreset="slide-in-bottom"
			>
				<Portal>
					<Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
					<Dialog.Positioner>
						<Dialog.Content
							w={{ base: "92vw", md: "440px" }}
							borderRadius="2xl"
							overflow="hidden"
						>
							<Dialog.Header
								px={{ base: 5, md: 6 }}
								py={4}
								borderBottom="1px solid"
								borderColor="ink.100"
							>
								<Flex align="center" gap={3} w="100%">
									<Flex
										align="center"
										justify="center"
										boxSize="40px"
										borderRadius="11px"
										bg="orange.100"
										color="orange.600"
										flexShrink={0}
									>
										<LuTriangleAlert size={20} />
									</Flex>
									<Stack gap={0} flex={1} minW={0}>
										<Dialog.Title
											fontSize="lg"
											fontWeight="bold"
											color="ink.900"
										>
											Revert changes?
										</Dialog.Title>
										<Text fontSize="sm" color="ink.500">
											This restores the published version.
										</Text>
									</Stack>
									<Dialog.CloseTrigger asChild>
										<CloseButton size="sm" />
									</Dialog.CloseTrigger>
								</Flex>
							</Dialog.Header>

							<Dialog.Body px={{ base: 5, md: 6 }} py={4}>
								<Text fontSize="sm" color="ink.600" lineHeight="1.6">
									Your current draft will be discarded and replaced with
									the live (published) version. Any unsaved or
									unpublished edits will be lost — this can't be undone.
								</Text>
							</Dialog.Body>

							<Dialog.Footer
								px={{ base: 5, md: 6 }}
								py={4}
								gap={2.5}
								borderTop="1px solid"
								borderColor="ink.100"
								flexDirection={{ base: "column-reverse", sm: "row" }}
							>
								<Button
									variant="outline"
									borderColor="ink.300"
									color="ink.700"
									onClick={() => setRevertConfirmOpen(false)}
									w={{ base: "100%", sm: "auto" }}
									flex={{ base: "none", sm: 1 }}
								>
									Cancel
								</Button>
								<Button
									colorPalette="orange"
									onClick={confirmRevert}
									gap={1.5}
									fontWeight="semibold"
									w={{ base: "100%", sm: "auto" }}
									flex={{ base: "none", sm: 1 }}
								>
									<LuUndo2 size={15} />
									Revert
								</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</>
	);
};

// Re-exported for callers that want to inspect a baseRoot directly
// (e.g. tests). No runtime use here.
export { parentKeysFromBaseRoot };
