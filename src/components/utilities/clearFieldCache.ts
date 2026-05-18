import store from "store2";

// Field-level theme values are owned by the backend, NOT by localStorage.
//
// Without this wipe, an admin removing data from the backend leaves the
// frontend showing stale localStorage values until the user opens an
// incognito window — because the schema-defaults hydration in
// `useThemeRootSections` is intentionally fill-missing, and the picker's
// `customStyleColorValuesAtom` reads `store(field.key)` once on mount.
//
// On every app boot we wipe everything that's keyed off a field — both the
// raw CSS-variable values (`--*`), the loader pick (`animation`), the
// dirty-list (`changedList`), and the per-account unsaved stashes
// (`unsaved:<locationId>`). Backend hydration then rebuilds the picture
// from scratch.
//
// Deliberately left in place — these are client-only state, not field values:
//   • `recentColors`           — the picker's swatch-row history
//   • `selectedTheme:dashboard` / `selectedTheme:login`
//                              — atom-persisted picks (still consistent
//                                with the backend's `dashboard_id` /
//                                `login_id` after re-hydration)
//   • `themes-list-count`      — skeleton-count hint
//   • `my-css`                 — CodeMirror's fast-path fallback
//   • legacy auth (`token`, `user`, `companyId`) — untouched
export const clearFieldCache = () => {
	const all =
		((store.getAll() as Record<string, unknown> | null | undefined) ?? {});
	Object.keys(all).forEach((key) => {
		if (
			key.startsWith("--") ||
			key.startsWith("unsaved:") ||
			key === "changedList" ||
			key === "animation"
		) {
			store.remove(key);
		}
	});
};
