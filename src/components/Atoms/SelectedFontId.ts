// Atoms/SelectedFontId.ts
import { atom } from "recoil";
export const selectedFontId = atom<string | null>({
    key: "selectedFontId",
    default: null,
});
