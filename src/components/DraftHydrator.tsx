import { useEffect, useLayoutEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useLocation } from "react-router-dom";
import useUserTheme, { useGetUpdatedUserThemeSetting } from "./services/api";
import { selectedThemeFamily } from "./Atoms/selectedThemeState";
import { levelModeAtom } from "./Atoms/levelMode";
import { applyThemeRoots } from "./utilities/applyThemeRoots";

// Mirrors the section detection in `useGetUpdatedUserThemeSetting` — derived
// from the URL so it flips when the user navigates between Theme Customize
// and Login Theme. Effect (1) below uses it to pick which roots namespace
// to paint onto :root.
type ActiveSection = "theme" | "login" | "other";
const sectionFromPathname = (pathname: string): ActiveSection => {
	const lower = pathname.toLowerCase();
	if (lower.includes("/logintheme")) return "login";
	if (lower.includes("/dashboard")) return "theme";
	return "other";
};

// Mounted at the MainLayout level. Three jobs:
//   (0) useLayoutEffect — when the Level Switcher toggles, reset the picker
//       atoms BEFORE the browser paints, so the user never sees the previous
//       account's theme name flash in the picker pill while the new draft is
//       fetched / hydrated.
//   (1) Paint the effective theme_roots onto :root, with :root wiped first
//       so stale --* properties from the previous account don't leak.
//   (2) Sync `selectedThemeFamily("dashboard"|"login")` from the effective
//       draft (agency fallback included).
//
// "Effective draft" = the current account's draft merged with the agency's
// for any slot the current account doesn't override. Computed in
// useGetUpdatedUserThemeSetting and returned alongside the raw `data`.
const DraftHydrator = () => {
	const { effectiveDraft, isSuccess } = useGetUpdatedUserThemeSetting();
	const { data: themesList } = useUserTheme();

	const setDashboardTheme = useSetRecoilState(selectedThemeFamily("dashboard"));
	const setLoginTheme = useSetRecoilState(selectedThemeFamily("login"));
	const level = useRecoilValue(levelModeAtom);
	const currentLocationId =
		level.mode === "subaccount"
			? level.subaccountId ?? "agency"
			: "agency";
	const { pathname } = useLocation();
	const activeSection = sectionFromPathname(pathname);

	const prevLocationIdRef = useRef<string | null>(null);
	const hydratedForLocationIdRef = useRef<string | null>(null);

	// (0a) Synchronously reset picker atoms on a level change BEFORE the
	// browser paints, so the user doesn't briefly see the previous
	// account's theme name. Effect (2) re-hydrates from the new draft.
	useLayoutEffect(() => {
		if (
			prevLocationIdRef.current !== null &&
			prevLocationIdRef.current !== currentLocationId
		) {
			setDashboardTheme(null);
			setLoginTheme(null);
			hydratedForLocationIdRef.current = null;
		}
		prevLocationIdRef.current = currentLocationId;
	}, [currentLocationId, setDashboardTheme, setLoginTheme]);

	// (0b) Synchronously wipe any --* properties already on :root when EITHER
	// the level OR the section flips — pre-paint — so the previous
	// account's/section's colours don't bleed through while we wait for the
	// new section's roots to be applied below.
	useLayoutEffect(() => {
		const styles = document.documentElement.style;
		for (let i = styles.length - 1; i >= 0; i--) {
			const prop = styles[i];
			if (prop?.startsWith?.("--")) styles.removeProperty(prop);
		}
	}, [currentLocationId, activeSection]);

	// (1) Apply the ACTIVE section's roots to :root.
	//
	// theme_roots and login_roots can collide on key names (e.g.
	// `--primary-color`) with different values. The single `:root` namespace
	// can only hold one, so we paint whichever section the user is currently
	// editing — that way `getComputedStyle(:root)` resolution inside
	// ColorDrawer's `var()` handling sees the correct colour, and any preview
	// element that uses `var(--…)` reflects the section the user is editing.
	useEffect(() => {
		if (!effectiveDraft) return;
		const sectionRoots =
			activeSection === "login"
				? effectiveDraft.login_roots
				: activeSection === "theme"
					? effectiveDraft.theme_roots
					: null;
		if (sectionRoots && !Array.isArray(sectionRoots)) {
			applyThemeRoots(sectionRoots as Record<string, string>);
		}
	}, [effectiveDraft, activeSection]);

	// (2) Sync atoms to the effective draft for the current account.
	useEffect(() => {
		if (hydratedForLocationIdRef.current === currentLocationId) return;
		if (!effectiveDraft) return;
		if (!themesList) return;

		const list = themesList as any;

		const matchTheme = (pool: any[] | undefined, uuid: string) =>
			pool?.find(
				(t: any) => t?.theme_uuid === uuid || t?.id === uuid
			);

		if (effectiveDraft.dashboard_id) {
			const match = matchTheme(list.dashboards, effectiveDraft.dashboard_id);
			if (match) {
				setDashboardTheme({
					theme_uuid: match.theme_uuid ?? match.id,
					title: match.title,
					image: match.image,
					id: match.id,
				});
			}
		}

		if (effectiveDraft.login_id) {
			const match = matchTheme(list.logins, effectiveDraft.login_id);
			if (match) {
				setLoginTheme({
					theme_uuid: match.theme_uuid ?? match.id,
					title: match.title,
					image: match.image,
					id: match.id,
				});
			}
		}

		hydratedForLocationIdRef.current = currentLocationId;
	}, [
		effectiveDraft,
		themesList,
		currentLocationId,
		setDashboardTheme,
		setLoginTheme,
	]);

	return null;
};

export default DraftHydrator;
