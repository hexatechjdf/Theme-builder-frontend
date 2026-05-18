// Single source of truth for backend URLs. Change `API_HOST` here and every
// axios instance / direct fetch picks it up automatically.
//
// In future this can be flipped to read `import.meta.env.VITE_API_HOST` so
// the build pipeline can swap it per environment without a code edit.
export const API_HOST = "http://toolkit.teamtesting.xyz";

// Theme-builder API root: every theme-builder endpoint lives under this path.
export const API_BASE_URL = `${API_HOST}/themebuilder/v1`;

// CRM proxy lives outside the theme-builder namespace on the same host.
export const CRM_HANDLER_URL = `${API_HOST}/api/v2/crm-handler`;
