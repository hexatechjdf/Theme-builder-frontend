import { useSyncExternalStore } from "react";
import {
	getChangedListSnapshot,
	subscribeChangedList,
} from "../store/changedListStore";

export interface ChangedListState {
	/** Field keys with unsaved edits — the live `changedList` from store2. */
	changedList: string[];
	/** Number of fields with unsaved edits. */
	count: number;
	/** True when there is at least one unsaved edit. */
	hasChanges: boolean;
}

/**
 * Reactive, read-only view of the `changedList` store2 key. Re-renders the
 * caller whenever the set of unsaved fields changes. Backed by a single
 * shared poll (see `changedListStore`) — does not write `changedList`, so the
 * existing field-editor / save logic is unaffected.
 */
export const useChangedList = (): ChangedListState => {
	const changedList = useSyncExternalStore(
		subscribeChangedList,
		getChangedListSnapshot,
		getChangedListSnapshot,
	);
	return {
		changedList,
		count: changedList.length,
		hasChanges: changedList.length > 0,
	};
};
