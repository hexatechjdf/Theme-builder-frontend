import { useEffect, useState } from "react";
import store from "store2";

// Central writer for theme-root edits.
//
// Why this exists:
//   The Theme Builder lets the user link one variable to another via the
//   `baseRoot` schema property (e.g. `--login-main-heading-color` stores
//   `var(--primary-color)`). A linked child's swatch is resolved from the
//   parent's value at mount time and cached in Recoil — so when the parent
//   was edited later in the same session, the child's swatch was stuck at
//   the old colour until full reload.
//
//   `writeRoot` is the single chokepoint every picker-driven edit goes
//   through. It does three things together:
//     1. Persists the raw value to `store2` (the save pipeline reads this).
//     2. Paints `document.documentElement.style.setProperty(key, value)` so
//        any DOM node using `style="background: var(--key)"` (or admin CSS
//        consuming `var(--key)`) updates immediately — no reload.
//     3. Fires the listener bus so React components that resolve var()
//        references can re-render via `useRootsVersion()`.
//
//   The bus is intentionally a plain module-level Set rather than a Recoil
//   atom — writes happen inside debounced callbacks deep in non-React code
//   (ColorDrawer's lodash-debounced updater), and dragging a Recoil setter
//   through every call-site would be a lot more wiring than this.

type Listener = () => void;
const listeners = new Set<Listener>();

const notify = () => {
	listeners.forEach((fn) => {
		try {
			fn();
		} catch {
			/* listener error shouldn't break other listeners */
		}
	});
};

const subscribeRoots = (fn: Listener): (() => void) => {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
};

// Persist a CSS-variable edit. `value` is the RAW form (raw tuple for
// rgb/hsl, hex for hex, full filter chain for filter, full gradient
// expression for gradient) — same shape that's already going into store2
// today, so callers don't need to change what they pass.
//
// IMPORTANT — this deliberately does NOT call `notify()`. Auto-cascading
// every parent edit to linked children was the wrong UX: the spec is "edit
// of a parent variable does not auto-cascade — the Apply Changes popup
// gates propagation per-child". The bus only fires from `notifyRoots()`,
// which is called from the popup-confirm handler after the user opts each
// child in/out.
export const writeRoot = (key: string, value: string) => {
	store(key, value);
	if (typeof document !== "undefined" && key.startsWith("--")) {
		document.documentElement.style.setProperty(key, value);
	}
};

// Fire the listener bus. Called from the propagation popup's confirm
// handler after the per-child decisions (keep linked / detach) have been
// applied to store2 and `:root`. ColorDrawer mount effects subscribed via
// `useRootsVersion` then re-resolve their `var(--parent)` references and
// push the new literals into Recoil so the picker swatches reflect the
// just-confirmed state.
export const notifyRoots = () => {
	notify();
};

// React hook: bumps every time a root is written. Use as a re-render
// trigger in components whose swatch depends on a `var(--parent)`
// reference (e.g. ColorInputFields' swatch, ColorDrawer's mount effect).
//
// Returning the counter is incidental — what consumers actually care about
// is the re-render. Components that need the latest store2 value should
// re-read store2 inside their render / effect after this hook fires.
export const useRootsVersion = (): number => {
	const [version, setVersion] = useState(0);
	useEffect(() => subscribeRoots(() => setVersion((v) => v + 1)), []);
	return version;
};
