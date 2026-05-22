import {
	SSO_TOKEN,
	APP_KEY,
	APP_ID,
	DEV_COMPANY_ID,
	IS_LOCAL_DEV,
} from "./appHeaders";

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

// Seeded so any request fired before the SSO handshake settles still carries
// headers. On LIVE the token/companyId seed is intentionally EMPTY — the
// hardcoded dev token must never go out on a real host (GHLSSOProvider gates
// the app behind a spinner until a real token arrives, so no live request
// should fire against this seed anyway; the empty seed is the safety net).
// On local dev we seed the hardcoded values so dev flows work without GHL.
let current: GhlRuntimeContext = {
	ssoToken: IS_LOCAL_DEV ? SSO_TOKEN : "",
	appKey: APP_KEY,
	companyId: IS_LOCAL_DEV ? DEV_COMPANY_ID : "",
	locationId: "",
	appId: APP_ID,
};

export const getGhlRuntimeContext = (): GhlRuntimeContext => current;

export const setGhlRuntimeContext = (next: GhlRuntimeContext): void => {
	current = next;
};
