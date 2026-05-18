import { SSO_TOKEN, APP_KEY, APP_ID, DEV_COMPANY_ID } from "./appHeaders";

// Module-scope mirror of `ghlContextAtom` for code that can't use Recoil
// hooks — chiefly the axios request interceptors, which are registered once
// at module load and read this on every outgoing request.
//
// GHLSSOProvider calls `setGhlRuntimeContext` whenever the SSO context
// changes, so a late SSO arrival (iframe handshake) is picked up by the next
// request without re-creating any axios instance.
export interface GhlRuntimeContext {
	ssoToken: string;
	appKey: string;
	companyId: string;
	locationId: string;
	appId: string;
}

// Seeded with the appHeaders fallbacks so any request fired before the SSO
// handshake settles (or in local dev) still carries valid headers.
let current: GhlRuntimeContext = {
	ssoToken: SSO_TOKEN,
	appKey: APP_KEY,
	companyId: DEV_COMPANY_ID,
	locationId: "",
	appId: APP_ID,
};

export const getGhlRuntimeContext = (): GhlRuntimeContext => current;

export const setGhlRuntimeContext = (next: GhlRuntimeContext): void => {
	current = next;
};
