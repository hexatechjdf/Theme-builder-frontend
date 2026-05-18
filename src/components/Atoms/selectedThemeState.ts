// recoil/selectedThemeState.ts
import { atom, atomFamily } from 'recoil';
import store from 'store2';

export type ThemeType = "dashboard" | "login";

export type Theme = {
  theme_uuid: string;
  title: string;
  image: string;
  // Some legacy callsites still write `id` — keep optional for back-compat.
  id?: string;
};

// Composite key — each (themeType, locationId) pair gets its OWN atom slot
// and its OWN localStorage key. This is the fix for cross-level leakage:
// previously the family was keyed only by themeType, so picking a theme on a
// subaccount would silently change the agency's selection (and vice-versa).
// Now agency and each subaccount keep independent picks.
export interface SelectedThemeKey {
  themeType: ThemeType;
  locationId: string;
}

const store2Effect = (key: string) => ({ setSelf, onSet }: any) => {
  const saved = store.get(key);
  if (saved != null) {
    setSelf(saved);
  }

  onSet((newValue: any) => {
    store.set(key, newValue);
  });
};

// `selectedTheme:<themeType>:<locationId>` — e.g.
//   selectedTheme:dashboard:agency
//   selectedTheme:dashboard:sub_xxx
//   selectedTheme:login:agency
// Each slot is independent. Hydration of a null slot from the backend's
// inherited dashboard_id / login_id happens in the page components
// (Dashboard / LoginTheme) so an empty slot on a fresh subaccount visit
// auto-fills with the agency's pick instead of stranding the page in
// NoThemeSelectedState.
export const selectedThemeFamily = atomFamily<Theme | null, SelectedThemeKey>({
  key: 'selectedThemeFamily',
  default: null,
  effects: ({ themeType, locationId }) => [
    store2Effect(`selectedTheme:${themeType}:${locationId}`),
  ],
});

// Legacy single-atom export. Kept so any older importer compiles, but it's
// no longer wired to anything — new code should use
// selectedThemeFamily({ themeType, locationId }).
export const selectedThemeState = atom<Theme | null>({
  key: 'selectedThemeState',
  default: null,
});
