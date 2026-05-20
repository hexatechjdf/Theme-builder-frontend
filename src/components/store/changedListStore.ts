import store from "store2";

// ── Reactive bridge over the `changedList` store2 key ──────────────────────
//
// `changedList` is a plain store2 (localStorage) array — every field editor
// (ColorDrawer, InputField, …) pushes its key into it on edit. store2 is NOT
// reactive: React never re-renders when it changes. UI that must know "are
// there unsaved changes right now?" (the navbar status pill, the leave-page
// guard, the save button's enabled state) needs a reactive view of it.
//
// This module is OBSERVE-ONLY — it never writes `changedList`, so the
// existing edit/clear logic stays completely untouched. It exposes a
// `useSyncExternalStore`-compatible (subscribe, getSnapshot) pair backed by a
// single shared low-frequency poll, plus `notifyChangedListChanged()` for our
// own code to push an instant update right after it clears the list on save.

const KEY = "changedList";
const POLL_MS = 300;

const readList = (): string[] => {
	const value = store(KEY);
	return Array.isArray(value) ? (value as string[]) : [];
};

// Cached snapshot — `getSnapshot` must return a referentially-stable value
// while the content is unchanged, otherwise useSyncExternalStore re-renders
// in a loop. We only build a new array when the JSON signature changes.
let cache: { signature: string; list: string[] } = (() => {
	const list = readList();
	return { signature: JSON.stringify(list), list };
})();

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

// Re-read store2; refresh the cache only when the content actually changed.
// Returns true when a change was detected.
const refresh = (): boolean => {
	const list = readList();
	const signature = JSON.stringify(list);
	if (signature === cache.signature) return false;
	cache = { signature, list };
	return true;
};

const emit = () => listeners.forEach((listener) => listener());

const tick = () => {
	// Skip work while the tab is backgrounded; `onVisible` catches up.
	if (typeof document !== "undefined" && document.hidden) return;
	if (refresh()) emit();
};

const onVisible = () => {
	if (typeof document !== "undefined" && !document.hidden) tick();
};

export const subscribeChangedList = (listener: () => void): (() => void) => {
	listeners.add(listener);
	if (intervalId === null) {
		intervalId = setInterval(tick, POLL_MS);
		if (typeof document !== "undefined") {
			document.addEventListener("visibilitychange", onVisible);
		}
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
			if (typeof document !== "undefined") {
				document.removeEventListener("visibilitychange", onVisible);
			}
		}
	};
};

// Returns the current changed-field-key list. Referentially stable until the
// content changes — safe as a `useSyncExternalStore` snapshot.
export const getChangedListSnapshot = (): string[] => cache.list;

// Push an immediate update — call right after our own code mutates
// `changedList` (e.g. clearing it on save success) so subscribers reflect it
// without waiting for the next poll.
export const notifyChangedListChanged = (): void => {
	if (refresh()) emit();
};
