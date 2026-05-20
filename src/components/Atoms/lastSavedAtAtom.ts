import { atom } from "recoil";
import store from "store2";

// Epoch-ms timestamp of the last successful draft save. Powers the navbar's
// "Draft saved · X min ago" label.
//
// Persisted in store2 under a `themebuilder:` key so it survives reload.
// `clearFieldCache` only wipes field-scoped keys (`--*`, `changedList`,
// `unsaved:*`, `animation`) on boot — this key is intentionally left alone.
const STORE_KEY = "themebuilder:lastSavedAt";

const persistEffect = ({ setSelf, onSet }: any) => {
	const saved = store.get(STORE_KEY);
	if (typeof saved === "number") setSelf(saved);

	onSet((value: number | null) => {
		if (typeof value === "number") store.set(STORE_KEY, value);
		else store.remove(STORE_KEY);
	});
};

export const lastSavedAtAtom = atom<number | null>({
	key: "lastSavedAt",
	default: null,
	effects: [persistEffect],
});
