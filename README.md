# Theme Builder

A React + TypeScript SPA for building white-labeled UI themes for an external CRM/funnel platform. Designed to render inside the GHL (Go High Level) marketplace as an embedded sidebar app, with full responsive support down to mobile widths.

Users edit CSS variables (colors, fonts, spacing, custom CSS) through structured pickers, save them to the backend as a draft theme, then publish draft → live.

---

## Tech stack

| Layer | Library |
|-------|---------|
| UI framework | React 18 + TypeScript ~5.6 |
| Build | Vite 6 |
| Component library | Chakra UI v3 + Ark UI primitives |
| Routing | react-router-dom v7 |
| State | Recoil (atoms / atomFamily / selectors), React Context, react-query |
| HTTP | axios (two instances: auth + theme-builder API) |
| Forms | react-hook-form + yup |
| Color picker | react-best-gradient-color-picker |
| CSS editor | CodeMirror v6 (via `@uiw/react-codemirror`) + csslint |
| Animation | framer-motion |
| Local persistence | `store2` |
| Notifications | react-toastify |
| Icons | react-icons (Lucide, Bootstrap, FontAwesome) |

---

## Getting started

```bash
npm install
npm run dev      # Vite dev server, default http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # preview the production build
```

The dev server picks the next free port if 5173 is taken.

---

## Architecture

### Schema-driven rendering

Every customizer page renders from a JSON schema describing sections (tabs) and fields (inputs). For Theme Customize and Login Theme the schema is now **fetched live from the backend per selected theme** via the `useThemeRootSections(theme_uuid)` hook ([api.ts](src/components/services/api.ts)) — there is no longer a static dummy schema in those flows. Loader Animation still uses a local dummy schema until that endpoint exists.

Until a theme is picked from the Theme Library popup, the page shows a [`NoThemeSelectedState`](src/components/Atoms/NoThemeSelectedState.tsx) empty state instead of any tabs/fields.

**Schema shape** ([themeSchema.ts](src/components/Dictionaries/themeSchema.ts)):

```ts
type FieldType = "color" | "spacing" | "number" | "text" | "select"
type ColorFormat = "rgb" | "hex" | "hsl"
type SpacingVariant = "single" | "full" | "custom"

type SchemaField =
  | (Base & { type: "color";   format?: ColorFormat })
  | (Base & { type: "spacing"; variant?: SpacingVariant })
  | (Base & { type: "number" })
  | (Base & { type: "text" })
  | (Base & { type: "select";  options: SchemaSelectOption[] })

type Base = { id, label, key, defaultValue?, value? }

type SchemaSection = { id, title, fields: SchemaField[] }
const themeSchema: SchemaSection[]
```

- **`id`**: stable record identifier (used as React key)
- **`key`**: storage / save-payload key — what gets sent to the backend in `roots`
- **`format`** (color): backend hint about how to display/serialize the value
- **`variant`** (spacing): how the field is rendered and serialized
  - `single` — one input, one stored value
  - `full` — one input, value applies to all 4 sides server-side
  - `custom` — collapsed view shows one shorthand input; expanded view shows 4 separate inputs (Top/Right/Bottom/Left). Stored as a single comma-separated string `"top,right,bottom,left"`

### Render pipeline

```
schema (JSON)
   │
   ▼
SchemaTabs ──── renders tab list + lazy-mounts active tab content
   │
   ▼
DynamicSection ── renders section title + responsive grid of fields
   │
   ▼
DynamicFieldRenderer ── switch on field.type → picks the right input component
   │
   ├─→ ColorPickerDrawerInputField  (color — picker + swatch, format-aware on save)
   ├─→ InputField (text)            (text — image URLs and other free-text)
   ├─→ InputField (number)          (number)
   ├─→ SingleSpacingField           (spacing/single)
   ├─→ FullSpacingField             (spacing/full)
   ├─→ CustomSpacingField           (spacing/custom — animated 4-side toggle)
   └─→ SelectField                  (select)
```

Each input component reads/writes its value to `store2` (a localStorage wrapper) keyed by `field.key`, and pushes the key into the `changedList` array. The save flow ([GetAllValues.tsx](src/components/utilities/GetAllValues.tsx)) iterates `changedList` and posts the values to `POST /themebuilder/v1/theme/setting`.

#### Default-value sync

`useThemeRootSections` synchronously **overwrites** `store(field.key)` with the backend's `defaultValue` on every fetch, except for keys present in `changedList` (which hold unsaved user edits). This means: edit the default in the admin → reload the app → the new default appears in the field, with no stale localStorage cache. After Save, `changedList` is cleared so the next fetch fully re-syncs.

#### Color format preservation

Color fields declare a `format` (`"rgb"` | `"hex"` | `"hsl"`). [ColorDrawer.tsx](src/components/Molecules/ColorDrawer.tsx) reads this prop and emits the saved value in that format — a field declared `"format": "rgb"` round-trips as `rgb(r, g, b)` (or `rgba(...)` when alpha < 1) instead of being silently coerced to hex. `format: "hsl"` falls back to hex for now (not yet wired into a backend field).

### Pages

| Route | Page | Layout |
|-------|------|--------|
| `/` | redirects to `/dashboard` | — |
| `/login` | Login (legacy, no longer required) | standalone |
| `/forget-password` | ForgetPassword (legacy) | standalone |
| `/verify-otp` | VerifyOtp (legacy) | standalone |
| `/dashboard` | Dashboard (Theme Customize) | MainLayout + tabs |
| `/LoginTheme` | LoginTheme | MainLayout + tabs |
| `/loader` | LoaderAnimation | MainLayout |
| `/custom-css` | CustomCss (CodeMirror editor) | MainLayout |

`MainLayout` wraps protected pages with the sticky purple navbar + white tab strip.

**SSO mode**: [ProtectedRoute.tsx](src/components/Layouts/ProtectedRoute.tsx) is currently a passthrough — auth is handled at the API layer via the `SSO-Token` / `APP-KEY` headers attached by every axios interceptor. The login pages still exist but nothing forces a user through them; `/` lands on `/dashboard` directly. Restore the original auth gate by re-enabling the `authState` check in `ProtectedRoute` if you re-introduce in-app login.

### Per-tab theme selection

Theme Customize and Login Theme each maintain their own selected theme — they do **not** share a single global selection any more. The state lives in [`selectedThemeFamily`](src/components/Atoms/selectedThemeState.ts), an `atomFamily<Theme | null, "dashboard" | "login">` with a separate `store2` slot per type (`selectedTheme:dashboard`, `selectedTheme:login`). [ThemeSelectorDialog.tsx](src/components/Dictionaries/ThemeSelectorDialog.tsx) takes a `themeType` prop to write into the right slot. Each page calls `useThemeRootSections(its-own-uuid)`, so a Dashboard pick fetches `/theme-root-sections/theme/{dashboard-uuid}` and a Login pick fetches the login uuid — independently.

### Agency vs Subaccount level

The navbar has a **Level Switcher** ([LevelSwitcher.tsx](src/components/Molecules/LevelSwitcher.tsx)) that toggles between agency-level and subaccount-level theming. The current mode is reflected in the URL as `?subaccount_id=<id>` and stays in sync via `useSearchParams`. Subaccount selection uses a searchable dropdown over a static dummy list ([levelMode.ts](src/components/Atoms/levelMode.ts)) — replace with API data when ready.

The current save/publish payloads still hardcode `locationId: "agency"`. To wire the level into save:

```ts
const level = useRecoilValue(levelModeAtom);
const locationId = level.mode === "subaccount" ? level.subaccountId : "agency";
```

Drop into [GetAllValues.tsx](src/components/utilities/GetAllValues.tsx), [PublishMenu.tsx](src/components/Molecules/PublishMenu.tsx), and [CustomCss.tsx](src/components/Pages/CustomCss.tsx) when the API is ready.

---

## Backend integration

### API base URL

Configured in [axiosConfig.ts](src/components/utilities/axiosConfig.ts):
```
https://word-racing-cheesy.ngrok-free.dev/themebuilder/v1
```
This is a development ngrok tunnel — replace with the production URL before shipping. The other axios instance ([axiosInstanceApi.ts](src/components/services/axiosInstanceApi.ts)) handles auth/OTP and points at the host root.

### SSO + APP-KEY headers

Every outgoing API request carries two custom headers:

| Header | Source | Purpose |
|--------|--------|---------|
| `SSO-Token` | [appHeaders.ts](src/components/utilities/appHeaders.ts) (hardcoded for now) | identifies the calling user/session — replaces in-app login |
| `APP-KEY` | [appHeaders.ts](src/components/utilities/appHeaders.ts) — `app_theme_builder` | identifies which marketplace app is calling |

Headers are attached by request interceptors on all three axios instances ([axiosConfig.ts](src/components/utilities/axiosConfig.ts), [axiosInstanceApi.ts](src/components/services/axiosInstanceApi.ts), [otpApi.ts](src/components/services/otpApi.ts)). When GHL injects the real SSO-Token at app boot, swap the constants in `appHeaders.ts` for whatever runtime source you read it from — the interceptor wiring stays.

> Backend CORS must whitelist `SSO-Token` and `APP-KEY` in `Access-Control-Allow-Headers`, otherwise the OPTIONS preflight blocks every request.

The legacy `Authorization` Bearer-token interceptor is still in place for back-compat (reads `localStorage.token`) but isn't required when SSO is used; `ngrok-skip-browser-warning` is also present so the tunnel doesn't serve the HTML interstitial.

### Endpoints in use

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/login` | login (legacy, no longer required in SSO mode) |
| `POST` | `/api/logout` | logout (legacy) |
| `POST` | `/api/send-otp` | password reset OTP (legacy) |
| `POST` | `/api/forgot-password` | password reset (legacy) |
| `GET`  | `/themebuilder/v1/themes-list` | preset templates per type — `dashboards[]`, `logins[]` |
| `GET`  | `/themebuilder/v1/theme-root-sections/theme/{theme_uuid}` | dynamic schema (sections + fields) for a selected theme |
| `GET`  | `/themebuilder/v1/themes` | current draft theme settings |
| `POST` | `/themebuilder/v1/theme/setting` | save theme (draft) |
| `POST` | `/themebuilder/v1/publishtolive` | publish draft → live (also used to revert) |
| `GET`  | `/themebuilder/v1/fonts-list` | custom fonts |

#### `/theme-root-sections/theme/{uuid}` response shape

```json
{
  "success": true,
  "data": {
    "theme_title": "Theme 1",
    "theme_root_sections": [
      {
        "id": 5,
        "theme_id": 3,
        "roots": [
          {
            "id": "section-...",
            "title": "Dashboard Base Style",
            "fields": [
              {
                "id": "field-...",
                "label": "Primary Color",
                "key": "--dashboard-primary-color",
                "defaultValue": "rgb(243, 155, 155)",
                "type": "color",
                "format": "rgb"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

`useThemeRootSections` unwraps `data.theme_root_sections[0].roots` and returns it as `SchemaSection[]`, plus the optional `theme_title`.

### Save payload shape

```json
{
  "locationId": "agency",
  "type": "draft",
  "theme_uuid": "<uuid>",
  "domain_uuid": "<uuid>",
  "fontSelected": "<font name>",
  "fontId": "<id or null>",
  "companyId": "<id>",
  "roots": {
    "--jdf-primary-color": "#735DFF",
    "--jdf-padding": "10px,20px,10px,15px",
    "--jdf-border-radius": "8px"
  },
  "custom_css": "..."  // optional, only when on the Custom CSS tab
}
```

Spacing `custom` fields are sent as a single comma-separated string under one key. Spacing `full` and `single` send a single CSS value.

---

## State management overview

### Recoil atoms (`src/components/Atoms/`)

| Atom | Purpose |
|------|---------|
| `authState` | Token + user + companyId, hydrated from localStorage (legacy — unused in SSO mode) |
| `selectedThemeUuidAtom` | Currently selected theme UUID (used by save payload) |
| `selectedThemeFamily` | `atomFamily<Theme \| null, "dashboard" \| "login">` — separate selection per tab type, persisted under `selectedTheme:dashboard` and `selectedTheme:login` |
| `selectedThemeState` | Legacy single-atom export — kept as a shim, no longer wired |
| `uuidAtom` | White-label `domain_uuid` for publish payloads |
| `levelModeAtom` | `{ mode: "agency" \| "subaccount", subaccountId }` |
| `publishStatusAtom` | `"live" \| "draft"` — drives the navbar `PublishStatusBadge` |
| `selectedFont`, `selectedFontId` | Font picker state (currently unused — Custom Fonts tab removed) |

### Recoil atomFamily ([customizationValueStore.ts](src/components/store/customizationValueStore.ts))

Per-field state, keyed by the field's storage key:
- `customStyleColorValuesAtom` — color picker state per key
- `customStyleNumericValuesAtom` — numeric input state per key
- `customStyleImagesInputAtom`, `dropDownsInputAtom`, `customStyleThemePresetInputAtom`

### `store2` localStorage

Synchronous mirror of editable values. Keys:
- `<field.key>` — the current value the user has typed/picked. Re-seeded from the backend's `defaultValue` on every `useThemeRootSections` fetch (unless the key is in `changedList`).
- `changedList` — array of keys the user has touched (drives the save payload). Cleared on a successful Save.
- `selectedTheme:dashboard`, `selectedTheme:login` — per-type theme picker selection (auto-managed by `selectedThemeFamily`'s store2 effect)
- `themes-list-count` — cached theme count for the loading-state skeleton
- `token`, `user`, `companyId` — legacy auth (unused under SSO)

---

## Project structure

```
src/
├── App.tsx                        # provider stack (Context, ReactQuery, Router, Recoil, Chakra)
├── ChakraProvider.tsx
├── ReactQueryProvider.tsx
├── theme.ts                       # Chakra theme config
├── main.tsx                       # entry point
└── components/
    ├── Atoms/                     # Recoil atoms + small atom-level components
    ├── context/                   # Custom CSS Context API
    ├── Dictionaries/              # static schemas + theme dialog data
    │   ├── themeSchema.ts         # Theme Customize fields
    │   ├── loginThemeSchema.ts    # Login Theme fields
    │   ├── loaderAnimationSchema.ts
    │   ├── inputFileds.ts         # legacy field dictionary (kept for reference)
    │   └── ThemeSelectorDialog.tsx
    ├── hooks/                     # react-query wrappers
    ├── Layouts/                   # MainLayout, ProtectedRoute, Styletabs
    ├── Molecules/                 # Navbar, PublishMenu, LevelSwitcher, ColorDrawer, InputField, etc.
    ├── Orginisms/                 # SchemaTabs, DynamicSection, DynamicFieldRenderer, ColorPicker*, Profile
    ├── Pages/                     # Login, ForgetPassword, VerifyOtp, Dashboard, LoginTheme, LoaderAnimation, CustomCss
    ├── Routes/                    # router config
    ├── services/                  # axios instances + api hooks
    ├── store/                     # atomFamily + selectors
    ├── ui/                        # Chakra v3 component wrappers (button, drawer, field, menu, etc.)
    └── utilities/                 # GetAllValues (save), getUserTheme, axiosConfig, appHeaders (SSO/APP-KEY constants)
```

> Note: a few legacy folder/file names contain typos baked into imports (`Orginisms`, `inputFileds`, `csssStringToObject`, `Insallation` — already removed). These are intentionally preserved for now to avoid noisy refactors. Do not rename without updating all imports.

> The `Custom Fonts` tab that used to live inside Theme Customize is gone — [Styletabs.tsx](src/components/Layouts/Styletabs.tsx) is now a thin pass-through over `SchemaTabs`. The `useFontList` hook and `selectedFont`/`selectedFontId` atoms remain unwired; if a future schema introduces a `font` field type it can be added in `DynamicFieldRenderer` and route through those existing atoms.

---

## Performance notes

The schema-driven UI carries a lot of components — without care, mounting the Theme Customize page can render hundreds of inputs at once. The following optimizations are baked in:

- **Lazy tab mount** — `<Tabs.Root lazyMount unmountOnExit={false}>` in `SchemaTabs`. Only the active tab's content mounts; other tabs mount on first visit and stay mounted afterward.
- **Memoization** — `DynamicSection` and `DynamicFieldRenderer` are wrapped in `React.memo`. Their props come from a constant schema, so re-renders are skipped when the parent re-renders.
- **Lazy-mounted color picker** — `react-best-gradient-color-picker` is heavy. `ColorDrawer` only instantiates the picker when the drawer is open, not for every closed swatch on the page.
- **Single ToastContainer** — only one in [App.tsx](src/App.tsx). Multiple containers caused duplicate toasts and unnecessary re-renders.
- **Per-theme query cache** — `useThemeRootSections` keys its react-query cache by `theme_uuid`, so re-selecting a previously fetched theme returns instantly from cache while a new theme fires a fresh request.

There's a `<Profiler>` wrapper around each tab's content in [SchemaTabs.tsx](src/components/Orginisms/SchemaTabs.tsx) that logs mount/update timings to the console (e.g. `[Profiler] 🟢 mount tab:section-base → 142.3ms`). Toggle off via the `PERF_LOG` constant at the top of the file.

---

## Things to know before changing things

- **Do not change save-payload field keys** without coordinating with the backend. Keys live in the schema's `field.key` property; render-side everything routes through `field.key`.
- **`spacing/custom` storage is a single comma-separated string**, not 4 separate keys. Don't split it on the way out unless the backend signs off.
- **Color `format` is now load-bearing** — `ColorDrawer` emits the saved value in the format declared by the schema (`rgb` round-trips as `rgb(...)`, `hex` stays hex). If you change the storage logic in `ColorDrawer`, keep the format-aware path intact.
- **`field.defaultValue` is the source of truth on every fetch** — `useThemeRootSections` overwrites `store(field.key)` with it unless the key is in `changedList`. This means stale localStorage values can no longer shadow a live admin update; just don't seed `changedList` for keys you didn't actually edit.
- **Don't reintroduce a global `selectedThemeState`** for new flows — use `selectedThemeFamily(themeType)` so dashboard and login selections stay independent.
- **SSO mode is the default** — the in-app login pages still build but aren't wired into `/`. If you re-enable in-app auth, restore the original `ProtectedRoute` body and switch the redirect at `/` back to `/login`.
- **Two axios instances** are configured for the same backend host but different path prefixes. Consolidate when the API stabilizes.

---

## Open follow-ups

- **Move `SSO_TOKEN` out of source.** Currently hardcoded in [appHeaders.ts](src/components/utilities/appHeaders.ts) for local dev. Read from a runtime source (`postMessage` from the GHL host, env var, or a session bootstrap endpoint) before shipping.
- **Wire selected theme into save payload.** [GetAllValues.tsx](src/components/utilities/GetAllValues.tsx) still reads `selectedThemeUuidAtom`, which is set to the *first* dashboard theme regardless of the user's pick. Switch it to `selectedThemeFamily(<currentTab>)?.theme_uuid`.
- **Wire `levelModeAtom` into save / publish / custom-css payloads** so subaccount mode actually scopes writes.
- **Replace the dummy schemas** still in use: `loaderAnimationSchema`, `DUMMY_SUBACCOUNTS`, and the static `themeSchema` fallback that `Styletabs` keeps as a safety default.
- **Add a runtime validator (e.g. zod)** at the `useThemeRootSections` boundary to fail loudly on shape mismatches.
- **Replace the hardcoded ngrok base URL** with environment-driven config (`import.meta.env.VITE_API_BASE_URL`).
- **Delete legacy code paths** confirmed unused: `Login` / `ForgetPassword` / `VerifyOtp` and `authState` once SSO is permanent; orphaned `StyleInputSection`, `StyleFilterInputSection`, `StyleInputSectionSideBarWidth`, `SetNumericValues`, `ColorPickerFilterDrawerField` (no longer routed through the renderer).
- **Refetch sections without a full reload.** `ColorDrawer`'s mount-time read of `store(id)` means an in-session refetch (e.g. from a manual "refresh" button) won't update an already-mounted swatch. If hot-refetch UX matters, make the drawer subscribe to store changes or remount on theme switch.
