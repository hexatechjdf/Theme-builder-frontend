import { atom } from 'recoil';
import store from 'store2';

export const uuidAtom = atom<string | null>({
    key: 'uuidAtom',
    default: store.get('domain_uuid') ?? null,
    effects: [
        ({ onSet }) => onSet(v => {
            if (v) store.set('domain_uuid', v);
            else store.remove('domain_uuid');
        }),
    ],
});
