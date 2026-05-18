// Hardcoded for local dev. In production GHL injects the real SSO at app boot —
// swap these constants then.
export const SSO_TOKEN =
	"U2FsdGVkX1/SwEdl0PiBtZq0F6Sq8pEMErbaVt1zc7IWnNg5yHvz6fKX64ylzdn3hcEAgX6J5o6G/Chzhz8MLJ4zgCibYYJzY7Yfg0+IAt4iDH0MS6vzkBB6j1eQjQZRXCL3cLIX6whIVhaMbvHjP3g19otVtldHbkgHNPyhayCk7IbsT0DFe/jXoIVb/UBpeBvsvGtX6RGYE62QnZdOuLDwjEVpYUxvywe8rjiHP2Ehsa+XyhBVm8mz40zeeYyLJ5dCP3Kq4wEUwJTIOOZrosPmAU+nvhEFQFGgvkKXpztteGV2vP6ouBee97LloMyGFmtqswTgn80hJFEZd1HL3yzh7Pvph9kaKSPbqWChM5A5QqhC744gb+4vGWksH92A5HU4Ts+8j+/sll8hHUCr6FBe+K5VZhqGffr8S6uuoETdy1CYUSHVL9xKehJRPNpSHZzYzggIWE8Q29WkiQsTC9b6wPfeQsE0oPIAPT8IQzxCy3mdCJ1+cUe/C4w4OuALOGO36tPxTunX8FWTcUWDqxbEum17/lvIwtTs+41FDKTioz0wcernZtKym0iRCsG9s7EPQGKRP/MKLhpD18SXRd4HEPoF0d0akNNsR3WyBjzkVJen2mpHbC+jA8t2MDnD";

export const APP_KEY = "app_theme_builder";

// GHL marketplace app id — used both in the postMessage SSO handshake
// (REQUEST_SSO_TOKEN) and in the CRM-handler request body.
export const APP_ID = "69d79fdae05393afc48ea4a3";

// Dev fallback company id. Used out of the GHL iframe (local dev) when there's
// no parent frame to supply the real per-user company_id via postMessage.
export const DEV_COMPANY_ID = "oEEb4PRxpIyxEV1LxLea";
