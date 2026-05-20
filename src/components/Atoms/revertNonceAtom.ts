import { atom } from "recoil";

// Incremented after a successful Revert. MainLayout uses it as a React `key`
// on the theme-content subtree, so the whole tree hard-remounts and every
// field component re-reads the freshly reverted draft from store2 — the
// revert applies instantly, with no full page reload.
export const revertNonceAtom = atom<number>({
	key: "revertNonce",
	default: 0,
});
