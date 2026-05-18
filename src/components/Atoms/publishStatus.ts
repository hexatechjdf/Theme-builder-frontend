import { atom } from "recoil";
import store from "store2";

export type PublishStatus = "live" | "draft";

const STORE_KEY = "publishStatus";

const persistEffect = ({ setSelf, onSet }: any) => {
	const saved = store.get(STORE_KEY);
	if (saved === "draft" || saved === "live") {
		setSelf(saved as PublishStatus);
	}

	onSet((newValue: PublishStatus) => {
		store.set(STORE_KEY, newValue);
	});
};

// Tracks whether the most recent save/publish action left the theme in a
// "draft" state (changes saved but not yet pushed live) or "live" state
// (everything is in sync with what end-users see).
//
// Defaults to "live" — flipped to "draft" the moment the Save button is hit,
// flipped back to "live" when Publish succeeds.
export const publishStatusAtom = atom<PublishStatus>({
	key: "publishStatus",
	default: "live",
	effects: [persistEffect],
});
