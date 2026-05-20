import { atom } from "recoil";

// Transient, in-flight save/publish activity. Lives only in memory (no
// persistence) — it describes what a mutation is doing RIGHT NOW.
//
// Set by the Save flow (GetAllValues) and the Publish flow (PublishMenu);
// read by the navbar SaveStatusIndicator. Lets those separate component
// trees share one "is something running?" signal without prop-drilling.
export type SaveActivity = "idle" | "saving" | "publishing" | "reverting";

export const saveActivityAtom = atom<SaveActivity>({
	key: "saveActivity",
	default: "idle",
});
