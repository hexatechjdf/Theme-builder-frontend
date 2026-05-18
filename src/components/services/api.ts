import axios from "axios";
import { useRef } from "react";
import store from "store2";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { useLocation } from "react-router-dom";
import useFetchData from "../hooks/useFetchData"; // Import the custom hook
import usePostData from "../hooks/usePostData";
import { CRM_HANDLER_URL } from "../utilities/apiConfig";
import type { SchemaSection } from "../Dictionaries/themeSchema";
import { levelModeAtom, type Subaccount } from "../Atoms/levelMode";
import { ghlContextAtom } from "../Atoms/ghlContext";

// `theme_roots` and `login_roots` can both define the same CSS-variable key
// with DIFFERENT values (e.g. `--primary-color`). Since they share the one
// global `store2` map and the one document `:root`, we must scope hydration
// to the section the user is currently editing. Derived from the URL so the
// hook re-evaluates on navigation between Theme Customize and Login Theme.
type ActiveSection = "theme" | "login" | "other";
const sectionFromPathname = (pathname: string): ActiveSection => {
	const lower = pathname.toLowerCase();
	if (lower.includes("/logintheme")) return "login";
	if (lower.includes("/dashboard")) return "theme";
	return "other";
};

interface Theme {
	id: string;
	link: string;
	roots: string;
	custom_css: string | null;
}

// interface ThemeResponse {
// 	default: Theme[];
// }


interface DashboardTheme {
	id: string;
	theme_uuid: string;
	title: string;
	type: string;
	image: string;
	roots: any[];
}

interface ThemeResponse {
	dashboards: DashboardTheme[];
	logins: DashboardTheme[];
	roots: Record<string, any>;
}


// Backend shape: { data: { "<id>": "<font name>", ... } } — same as /loaders-list.
export interface FontListResponse {
	data: Record<string, string>;
}



const useUserTheme = () => {
	const { data, error, isLoading } = useFetchData<ThemeResponse>(
		// "/theme-builder/themes"
		"/themes-list"
	);

	return { data, error, isLoading };
};



export default useUserTheme;



export const usePostThemeSetting = () => {
	const url = "/theme/setting";

	const { mutate, isLoading, isError, isSuccess, error, data } =
		usePostData<ThemeResponse>(url);

	return { mutate, data, isLoading, isError, isSuccess, error };
};


// Shape returned by GET /themes/{locationId} — the user's saved draft state.
// Backend quirk: empty CSS maps come back as `[]` instead of `{}`, so each
// roots field is either a real map, an empty array sentinel, or null.
export interface DraftThemeRecord {
	id: string;
	loader_id: string | null;
	dashboard_id: string | null;
	login_id: string | null;
	theme_roots: Record<string, string> | [] | null;
	login_roots: Record<string, string> | [] | null;
	font: { font_id: number | string | null; fontSelected: string | null } | null;
	custom_css: string | null;
}

export interface DraftThemeResponse {
	themes: {
		draft: DraftThemeRecord[];
	};
}

export const useGetUpdatedUserThemeSetting = () => {
	const level = useRecoilValue(levelModeAtom);
	const locationId =
		level.mode === "subaccount" ? level.subaccountId ?? "agency" : "agency";
	const url = `/themes/${locationId}`;

	// Which section is the user editing? `theme_roots` and `login_roots` can
	// define the same key with different values, so we must scope hydration
	// to ONE namespace per page. Derive from the route — reactive on nav.
	const { pathname } = useLocation();
	const activeSection = sectionFromPathname(pathname);

	const { isLoading, isError, isSuccess, error, data } =
		useFetchData<DraftThemeResponse>(
			url,
			// keepPreviousData MUST be false here: when the user switches the
			// Level Switcher, the queryKey changes from one location to another.
			// With keepPreviousData=true (the global default) react-query would
			// hand DraftHydrator the *previous* level's draft for a few ms while
			// the new fetch runs — and our hydrator would then attach that
			// stale data to the new locationId and refuse to re-run when the
			// real new draft arrives. Always wait for the current level's data.
			{ keepPreviousData: false },
			["updatedUserThemeSetting", locationId]
		);

	// Always keep the agency draft in cache too — it's the fallback source
	// when a subaccount has no theme of its own. Subscribed unconditionally
	// so it kicks off in parallel with the sub's fetch (otherwise they race
	// and the sub's response can land before agency's, causing the merged
	// draft below to be computed without the agency half).
	// On agency this subscribes to the same query as `data` above, so
	// react-query dedupes — only one network request.
	const { data: agencyData } = useFetchData<DraftThemeResponse>(
		"/themes/agency",
		{ keepPreviousData: false },
		["updatedUserThemeSetting", "agency"]
	);

	// SYNCHRONOUSLY handle level changes in render, BEFORE the saved-data
	// write below. Has to happen here (not in a useEffect) because:
	//   1. The saved-data write right after this runs in render too — and
	//      it filters writes by `changedList`. If clearing/restoring
	//      changedList happened later (in an effect), the write would still
	//      see the old account's changedList and skip the wrong keys.
	//   2. Field components read store(field.key) in their own mount effects;
	//      we have to give them the right store2 state before they mount.
	//
	// What it does on a level change:
	//   • Stash the current changedList + its values under
	//     `unsaved:<oldLoc>` so the user's in-flight edits aren't lost on a
	//     level toggle.
	//   • Wipe all --* keys, the loader pick, and changedList from store2.
	//   • Restore `unsaved:<newLoc>` if the new account had unsaved edits
	//     queued from a previous visit this session.
	// Combined session key — flips on EITHER a level change OR a section
	// (page) change. Both invalidate the current store2 / :root namespace
	// because:
	//   • level change: different account scope, different values entirely
	//   • section change: theme_roots vs login_roots can collide on key
	//     names (--primary-color, --secondary-color) with different values
	const seenSessionRef = useRef<string | null>(null);
	const sessionKey = `${locationId}::${activeSection}`;
	if (seenSessionRef.current !== sessionKey) {
		if (seenSessionRef.current !== null) {
			const [prevLoc] = seenSessionRef.current.split("::");
			const levelChanged = prevLoc !== locationId;
			const oldLoc = prevLoc;

			// Stash the previous account's unsaved changes — ONLY on a level
			// change, since unsaved edits are account-scoped. A section flip
			// within the same account just wipes for the new namespace.
			if (levelChanged) {
				const prevChangedList = (store("changedList") as string[]) || [];
				if (prevChangedList.length > 0) {
					const stashedValues: Record<string, string> = {};
					prevChangedList.forEach((k) => {
						const v = store(k);
						if (typeof v === "string") stashedValues[k] = v;
					});
					store(`unsaved:${oldLoc}`, {
						changedList: prevChangedList,
						values: stashedValues,
					});
				} else {
					store.remove(`unsaved:${oldLoc}`);
				}
			}

			// Clear store2 of everything scoped to the previous namespace
			// (account + section). Always — for both level and section flips.
			const all = (store.getAll() as Record<string, unknown>) ?? {};
			Object.keys(all).forEach((k) => {
				if (k.startsWith("--")) store.remove(k);
			});
			store.remove("animation");
			store("changedList", []);

			// On a LEVEL change, restore the new account's previously-stashed
			// unsaved edits. (On a pure section change we deliberately skip
			// restoration — the stash is per-account, not per-section.)
			if (levelChanged) {
				const stash = store(`unsaved:${locationId}`) as
					| { changedList?: string[]; values?: Record<string, string> }
					| null;
				if (stash && typeof stash === "object") {
					const restoredValues = stash.values || {};
					const restoredList = stash.changedList || [];
					Object.entries(restoredValues).forEach(([k, v]) => {
						if (typeof v === "string") store(k, v);
					});
					store("changedList", restoredList);
				}
			}
		}
		seenSessionRef.current = sessionKey;
	}

	// Effective draft = the data we actually use for hydration. For a sub-
	// account, if the sub has no theme of its own (dashboard_id is null),
	// fall back to the agency's draft for that slot. Each slot
	// (dashboard / login / loader) falls back independently — a sub can have
	// its own login theme but still inherit the agency's dashboard, etc.
	//
	// Gated on BOTH queries being loaded — on a subaccount we must have the
	// agency draft in hand before we can compute the fallback. Until both
	// are ready, effectiveDraft is null and DraftHydrator (which keys off
	// it) keeps Dashboard in `NoThemeSelectedState`, preventing field
	// components from mounting against incomplete store2.
	const isAgencyReady = locationId === "agency" || agencyData !== undefined;
	const effectiveDraft = isAgencyReady
		? computeEffectiveDraft(
				data?.themes?.draft?.[0] ?? null,
				agencyData?.themes?.draft?.[0] ?? null,
				locationId
			)
		: null;

	// Hydrate store2 / publish state from the effective draft. Runs in the
	// hook body (not a useEffect) for the same reason useThemeRootSections
	// does: child components (ColorDrawer etc.) read store(field.key) on
	// their own mount-time effects, which fire BEFORE effects in this hook
	// would. User edits in `changedList` are protected — we never overwrite
	// a key the user is actively editing.
	if (effectiveDraft) {
		const changedList = (store("changedList") as string[]) || [];
		const writeIfClean = (key: string, value: string | number | null | undefined) => {
			if (!key) return;
			if (value === null || value === undefined) return;
			if (changedList.includes(key)) return;
			store(key, String(value));
		};

		// Only write the ACTIVE section's roots — theme_roots and login_roots
		// share key names with different values, so writing both into the
		// single store2 namespace would let one section's value silently
		// shadow the other depending on order. On non-customise pages
		// (e.g. /loader, /custom-css) neither is written; the loader/css
		// editors don't depend on store2 CSS variables anyway.
		const sectionRoots =
			activeSection === "login"
				? effectiveDraft.login_roots
				: activeSection === "theme"
					? effectiveDraft.theme_roots
					: null;
		if (sectionRoots && !Array.isArray(sectionRoots)) {
			Object.entries(sectionRoots).forEach(([key, value]) => {
				writeIfClean(key, value as string);
			});
		}
		// Loader picker (LoaderAnimation page reads store("animation")).
		writeIfClean("animation", effectiveDraft.loader_id);
		// Per-field font picks (type: "fonts") ride inside theme_roots as CSS
		// variables (e.g. "--buttons-font"), so they're already covered by the
		// theme_roots loop above. The top-level `font.font_id` from the draft
		// response is the legacy global-font slot — no UI consumes it now.
	}

	// `isHydrated` is the signal callers should gate field rendering on. It's
	// true when:
	//   • the location's draft fetch is no longer in-flight, AND
	//   • for subaccount levels, the agency fallback fetch has also finished
	//     (so `computeEffectiveDraft` has had everything it needs).
	//
	// Pages that mount field components (ColorDrawer, InputField, …) must wait
	// for this. ColorDrawer reads `store(id)` once in its mount-time effect
	// and locks the value into its Recoil atom; if it mounts before the draft
	// hydrator has written the user's saved value into store2, the atom freezes
	// on the schema default and a late draft write can't fix it without a
	// remount. Reload-flicker between "schema default" and "saved value" was
	// caused by exactly that race.
	const isHydrated = !isLoading && isAgencyReady;

	return {
		data,
		agencyData,
		effectiveDraft,
		isHydrated,
		isLoading,
		isError,
		isSuccess,
		error,
	};
};

// Merges a subaccount's draft with the agency's draft so that any slot the
// sub doesn't override falls through to the agency. Sub-on-sub: each level's
// state stays its own; only EMPTY slots inherit.
export const computeEffectiveDraft = (
	draft: DraftThemeRecord | null,
	agencyDraft: DraftThemeRecord | null,
	locationId: string
): DraftThemeRecord | null => {
	if (!draft) return null;
	if (locationId === "agency") return draft;
	if (!agencyDraft) return draft;
	return {
		...draft,
		dashboard_id: draft.dashboard_id ?? agencyDraft.dashboard_id,
		login_id: draft.login_id ?? agencyDraft.login_id,
		loader_id: draft.loader_id ?? agencyDraft.loader_id,
		// If the sub has no dashboard pick at all, inherit agency's theme_roots
		// for it. If the sub HAS its own dashboard pick (even with no roots
		// overrides yet), keep the sub's empty theme_roots so the schema's
		// defaultValues are used — don't tint the sub with agency's overrides
		// for a theme they explicitly picked.
		theme_roots: draft.dashboard_id
			? draft.theme_roots
			: agencyDraft.theme_roots,
		login_roots: draft.login_id
			? draft.login_roots
			: agencyDraft.login_roots,
		custom_css: draft.custom_css ?? agencyDraft.custom_css,
	};
};


export const usePublishThemeToLive = () => {
	const url = "/publishtolive";

	// expose mutate function
	const mutation = usePostData(url);

	return {
		...mutation,
	};
};





export const useFontList = () => {
	const { data, error, isLoading } =
		useFetchData<FontListResponse>("/fonts-list");
	// Normalize { data: { "<id>": "<name>" } } to a [{ value, label }] list
	// for select-style consumers.
	const fonts = data?.data
		? Object.entries(data.data).map(([value, label]) => ({ value, label }))
		: [];
	return { fonts, error, isLoading };
};


interface LoadersListResponse {
	data: Record<string, string>;
}

export const useLoadersList = () => {
	const { data, error, isLoading } =
		useFetchData<LoadersListResponse>("/loaders-list");
	// Backend returns { data: { "<id>": "<name>", ... } } — normalize to the
	// { value, label }[] shape that select fields consume.
	const loaders = data?.data
		? Object.entries(data.data).map(([value, label]) => ({ value, label }))
		: [];
	return { loaders, error, isLoading };
};


interface ThemeRootSectionsResponse {
	data: {
		theme_title?: string;
		theme_root_sections: { id: number; roots: SchemaSection[]; theme_id: number }[];
	};
}

export const useThemeRootSections = (themeUuid: string | null | undefined) => {
	const { data, error, isLoading, isFetching } =
		useFetchData<ThemeRootSectionsResponse>(
			`/theme-root-sections/theme/${themeUuid}`,
			{ enabled: !!themeUuid },
			["theme-root-sections", themeUuid ?? ""]
		);
	const sections = data?.data?.theme_root_sections?.[0]?.roots ?? [];
	const themeTitle = data?.data?.theme_title;

	// Seed each field's `defaultValue` into store2 — but ONLY if no value is
	// already present. The user's saved draft values arrive separately via
	// `useGetUpdatedUserThemeSetting` and must always win over schema defaults;
	// since both hooks fetch asynchronously, "always overwrite" caused a race
	// where the schema's default would clobber the saved value when the
	// schema response landed last. With fill-missing semantics, race order
	// stops mattering — draft writes user values, schema only fills the gaps.
	//
	// Done synchronously in the hook body (not a useEffect) because child
	// components (ColorDrawer etc.) read the store during their own mount-time
	// effects, which fire BEFORE this hook's effects would.
	//
	// Trade-off: admin-side default changes don't auto-propagate to a user
	// who's already saved that field — the saved value sticks. If we ever
	// need that flow back, gate the "fill-missing" check on whether the
	// draft's `dashboard_id` matches the user's currently picked theme.
	if (sections.length) {
		const changedList = (store("changedList") as string[]) || [];
		sections.forEach((section) => {
			section.fields.forEach((field) => {
				if (!field?.key) return;
				if (changedList.includes(field.key)) return;
				const existing = store(field.key);
				if (existing !== undefined && existing !== null && existing !== "") return;
				if (field.defaultValue !== undefined) {
					store(field.key, field.defaultValue);
				}
			});
		});
	}

	return { sections, themeTitle, error, isLoading, isFetching };
};

// The CRM proxy lives outside the theme-builder namespace on the same host.
// It also needs a different SSO-Token, so this call bypasses the shared axios
// instance (whose interceptor would overwrite SSO-Token with the theme-builder
// value) and goes out via raw axios with the headers spelled out below.
//
// `company_id` / `app_id` for the request body come from the live GHL context
// (ghlContextAtom) — see useSubaccounts below — not from hardcoded constants.
const CRM_SSO_TOKEN =
	"U2FsdGVkX1/LS56wm3iXnP55YZRpQsgdI3EKkkbi9mSYbRIk0qHfnRWh6zsBnjitljha/LENAPy6VY1xi06PObqYBUtZDdx7PxpPkXmvdWQyX2/3lu6wC9yAP5+rtCb+vPXAhv7WL9mtZEl3mlyHVjejw7AFLBnFozYtwYka1nAeKsZY6wQ+s60vGqdg16gKAg5yliP/z70vcXyhAVZ107VFR57XQJmk2CECSYqBUO/LPkzXAOtXvVBNXc/5jkChQSZuq8Uz+N/mPyKNhaBCXrWDdUqxGXE2RbXq0TwQenQIg0oNDOrFk6tGST54kuabNE3lVgd1hXRsH1/h9c5bptInScJ8vV/mAIDBFBzCcHE06+RueDC+fcf6V3ridwqyuzRzctG/w1JYaUSm+9JXguI6iKsqwt+YZNmkUuc24ESLiiSGuhcCtLTQm2Xj3cqXUEq53k/R67MaHGyg2WbzfSggEVQ26pztbOo2VJ2RTmIQQsZJoeU3ltYbAW9hL9PeFT0TJrlFLKfhrxtNbtvFoZ7gIEnJ8fK25W4f6a1/k4U6MOPS/jnvhqAg04jJiTKXge++vep8aKoiruOObZcWKcjcXuKJs4YQni3M0CzxW8L8Av7pUBNHgJvOw2ocYvow";
	// "U2FsdGVkX18yiat00Xm5IRoB4xDkJfrWxb0smULkODR+XV1PJv1V/yOjEDhq1JPgDQ8vpwWA4BXI0qrj/1zlHwfYTIUrDUL2hQNKAndizxVNPbF+x06H7ixeZdfzplnPgWmdidJ1ZXIjyhTRZX4adeliXNmexnQZAAHYQBWp52pCoFobN3q4e4/2DzY5XsrfZzfT2F/VIXkTDfU2fpL/0BOitl1Ck8udCeKwiAYmLuNTK17rR0s4XBsg09+xZROGtql/Yn7iITLorQV/sbtShwlNY/X0E6fbTM/vqDprE7Vs+3DQd8zoDTdeBrE+q6EEui4dI6RNYzCuRMGv4cbDM7Abhpv2UO0MV/FTCBi07Hd/Yfxhb82sH14kvhy4xiIJSgC3C/1puiiciBgar876wneMeqgfGkx8kqEc1y8aKuLroQ28YQ1JnKHaG8f9WHSH7r2OLMySYVXeBykPAR7EMO0A5XPV5Mht2pLVHtd30W9613BGc5eV3VwvuMwQxq3UH4NFI/0fuQuouCr/X8DBuBpw8i19/BxZ4txRYLD59TCRSBIj+cH0qGj9AoY1WyGwyOAUXVgVB3l4yzPfgCOEObUFZv2RcyefqQNB9tAkD4e5CqYzqGGRpQVXdp8shKoK"; // for ngrok link


export const useSubaccounts = () => {
	// company_id / app_id come from the live GHL SSO context. Out of the GHL
	// iframe these are the appHeaders dev fallbacks; inside it they're the
	// real per-user values from the postMessage handshake.
	const ghl = useRecoilValue(ghlContextAtom);

	const { data, isLoading, isFetching, error } = useQuery<Subaccount[], Error>(
		["subaccounts", ghl.companyId, ghl.appId],
		async () => {
			try {
				const body = {
					type: "company",
					company_id: ghl.companyId,
					location_id: "",
					method: "GET",
					url: "locations/search?limit=100",
					data: "",
					app_id: ghl.appId,
				};
				const res = await axios.post(CRM_HANDLER_URL, body, {
					headers: {
						"Content-Type": "application/json",
						"SSO-Token": CRM_SSO_TOKEN,
						"APP-KEY": ghl.appKey,
					},
				});
				const locations: any[] = res.data?.data?.locations ?? [];
				return locations
					.map((loc) => ({ id: loc?.id ?? "", name: loc?.name ?? "Unnamed" }))
					.filter((s) => s.id);
			} catch (err: any) {
				console.error(
					"[useSubaccounts] /crm-handler error:",
					err?.response?.status,
					err?.response?.data ?? err?.message
				);
				throw err;
			}
		},
		{
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
			retry: 1,
		}
	);

	return {
		subaccounts: data ?? [],
		isLoading: isLoading || isFetching,
		error,
	};
};

