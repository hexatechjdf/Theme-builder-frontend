// Single source of truth for backend URLs. Change `API_HOST` here and every
// axios instance / direct fetch picks it up automatically.
//
// In future this can be flipped to read `import.meta.env.VITE_API_HOST` so
// the build pipeline can swap it per environment without a code edit.
//
// MUST stay https — the app is served over https (Vercel + the GHL iframe),
// and browsers block mixed-content (http) XHR from an https page.
export const API_HOST = "https://hub.jdfunnel.com";

// Theme-builder API root: every theme-builder endpoint lives under this path.
export const API_BASE_URL = `${API_HOST}/themebuilder/v1`;

// CRM proxy lives outside the theme-builder namespace on the same host.
export const CRM_HANDLER_URL = `${API_HOST}/api/v2/crm-handler`;
