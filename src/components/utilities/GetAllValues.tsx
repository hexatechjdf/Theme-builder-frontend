import { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Button } from "../ui/button";
import store from "store2";
import { usePostThemeSetting } from "../services/api";
import type { DraftThemeResponse } from "../services/api";
import { useQueryClient } from "react-query";
import { Spinner } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { selectedThemeFamily } from "../Atoms/selectedThemeState";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { levelModeAtom } from "../Atoms/levelMode";
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
	const queryClient = useQueryClient();
	const setPublishStatus = useSetRecoilState(publishStatusAtom);

	/* ─────── Link-propagation dialog state ─────── */
	const [dialogOpen, setDialogOpen] = useState(false);
	const [pendingGroups, setPendingGroups] = useState<LinkPropagationGroup[]>([]);

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
	const runMutation = async () => {
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
				return;
			}
			payload = {
				section: "loader",
				type: "draft",
				locationId,
				loader_id: loaderId,
			};
		}

		try {
			await mutate(payload, {
				onSuccess: () => {
					toast.success("Saved as draft — click Publish to push live");
					store("changedList", []);
					setPublishStatus("draft");
					// Invalidate every variant — react-query treats keys as a
					// prefix match when you pass the partial key, so this also
					// hits ["updatedUserThemeSetting", "<locationId>"].
					queryClient.invalidateQueries(["updatedUserThemeSetting"]);
				},
				onError: (error) => {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to update theme. Please try again."
					);
				},
			});
		} catch (err) {
			toast.error("An unexpected error occurred");
			console.error("Error posting theme:", err);
		}
	};

	const postValue = async () => {
		const changedList: string[] = store("changedList") || [];

		// Theme / login require user changes; loader is gated on whether a
		// loader has been picked at all.
		if (section === "theme" || section === "login") {
			if (changedList.length === 0) {
				toast.warning("You have not changed any values");
				return;
			}
		}

		// Loader doesn't carry roots → no link propagation possible.
		if (section === "loader") {
			runMutation();
			return;
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
			runMutation();
			return;
		}

		// Otherwise: open the popup. The confirm-handler will apply the
		// chosen link/detach state to store2, then run the mutation.
		setPendingGroups(groups);
		setDialogOpen(true);
		// Stash savedRoots on the component so the confirm-handler can read it
		// without recomputing — keep it inside this closure via the handler.
		// (We don't need to persist beyond this click; the handler is closed
		// over the local snapshot.)
		// — implemented inline via handleConfirm below using getSavedRootsForSection().
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
		runMutation();
	};

	const handleCancel = () => {
		setDialogOpen(false);
		setPendingGroups([]);
	};

	return (
		<>
			<Button
				onClick={postValue}
				size="sm"
				disabled={isLoading}
				flexShrink={0}
			>
				{isLoading ? (
					<>
						<Spinner size="sm" mr={2} />
						Saving…
					</>
				) : (
					"Apply Changes"
				)}
			</Button>
			<LinkPropagationDialog
				open={dialogOpen}
				groups={pendingGroups}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		</>
	);
};

// Re-exported for callers that want to inspect a baseRoot directly
// (e.g. tests). No runtime use here.
export { parentKeysFromBaseRoot };
