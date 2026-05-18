

import { atom } from 'recoil';

export const storeUrlAtom = atom<string>({
    key: 'storeUrlAtom',
    default: '',
})