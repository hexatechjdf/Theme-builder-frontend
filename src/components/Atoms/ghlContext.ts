import { atom } from "recoil";
import {
	SSO_TOKEN,
	APP_KEY,
	APP_ID,
	DEV_COMPANY_ID,
} from "../utilities/appHeaders";

// Live GHL marketplace context for the current session.
//
// Inside the GHL iframe this is populated from the postMessage SSO handshake
// (see GHLSSOProvider). Out of the iframe (local dev) it stays on the
// appHeaders.ts fallback constants so dev flows keep working.
//
// React-tree consumers read this via `useRecoilValue(ghlContextAtom)`. Axios
// interceptors can't use Recoil hooks — they read the module-singleton mirror
// in `ghlRuntimeContext.ts`, which GHLSSOProvider keeps in sync with this atom.
export interface GhlContext {
	ssoToken: string;
	appKey: string;
	companyId: string;
	locationId: string;
	appId: string;
	// true once the SSO handshake (or its fallback) has settled.
	hydrated: boolean;
}

export const ghlContextAtom = atom<GhlContext>({
	key: "ghlContextAtom",
	default: {
		ssoToken: SSO_TOKEN,
		appKey: APP_KEY,
		companyId: DEV_COMPANY_ID,
		locationId: "",
		appId: APP_ID,
		hydrated: false,
	},
});
