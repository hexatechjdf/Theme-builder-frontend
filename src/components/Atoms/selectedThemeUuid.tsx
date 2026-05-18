// Atoms/selectedThemeUuid.ts
import { atom } from 'recoil';

export const selectedThemeUuidAtom = atom<string | null>({
    key: 'selectedThemeUuid',
    default: null,
});
