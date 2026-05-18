import { useCallback, useEffect, type ReactNode } from "react";
import { useRecoilState } from "recoil";
import { ghlContextAtom, type GhlContext } from "../Atoms/ghlContext";
import { setGhlRuntimeContext } from "../utilities/ghlRuntimeContext";
import {
	SSO_TOKEN,
	APP_KEY,
	APP_ID,
	DEV_COMPANY_ID,
} from "../utilities/appHeaders";

// How long to wait for the GHL parent frame to answer REQUEST_SSO_TOKEN
// before falling back to the appHeaders defaults.
const SSO_TIMEOUT_MS = 8000;

// Origins the SSO_TOKEN_RESPONSE message is allowed to come from. A message
// from any other origin is ignored.
const ALLOWED_ORIGINS = [
	"https://app.gohighlevel.com",
	"https://marketplace.leadconnectorhq.com",
	"https://app.leadconnectorhq.com",
];

// Hosts where the postMessage handshake is allowed over plain http (a local
// dev harness). Everywhere else the app must be served over https — browsers
// block mixed-content requests from inside the HTTPS GHL iframe.
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

type SsoContext = Omit<GhlContext, "hydrated">;

/**
 * GHL marketplace SSO bootstrap.
 *
 * Inside the GHL iframe: runs a postMessage handshake with the parent frame to
 * receive a per-user SSO-Token / company_id / location_id, then wires those
 * into `ghlContextAtom` (React-tree) and the `ghlRuntimeContext` singleton
 * (axios interceptors). Gates the app render behind a spinner until settled.
 *
 * Out of the iframe (local dev): immediately commits the appHeaders.ts
 * fallback constants — no postMessage, no 8s wait — so dev flows just work.
 */
export default function GHLSSOProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [ctx, setCtx] = useRecoilState(ghlContextAtom);

	// Push a settled context into BOTH the Recoil atom (React-tree consumers)
	// and the module singleton (axios interceptors), and lift the spinner.
	const commit = useCallback(
		(next: SsoContext) => {
			setCtx({ ...next, hydrated: true });
			setGhlRuntimeContext({
				ssoToken: next.ssoToken,
				appKey: next.appKey,
				companyId: next.companyId,
				locationId: next.locationId,
				appId: next.appId,
			});
		},
		[setCtx],
	);

	// Fall back to the hardcoded appHeaders defaults — used for local dev
	// (no iframe) and when the GHL handshake errors out or times out.
	const commitFallback = useCallback(() => {
		commit({
			ssoToken: SSO_TOKEN,
			appKey: APP_KEY,
			companyId: DEV_COMPANY_ID,
			locationId: "",
			appId: APP_ID,
		});
	}, [commit]);

	useEffect(() => {
		// Not embedded in a parent frame → local dev / direct page load.
		// There's no GHL parent to handshake with; use the fallback now.
		if (window.parent === window) {
			commitFallback();
			return;
		}

		const isLocalHost = LOCAL_HOSTS.includes(window.location.hostname);
		let settled = false;

		// Run `fn` exactly once — whichever of the response handler or the
		// timeout fires first wins; the other becomes a no-op.
		const finish = (fn: () => void) => {
			if (settled) return;
			settled = true;
			fn();
		};

		const handleMessage = (event: MessageEvent) => {
			if (!ALLOWED_ORIGINS.includes(event.origin)) return;
			// Only trust the handshake over https (or on a local dev host).
			if (!isLocalHost && window.location.protocol !== "https:") return;

			const data = event.data;
			if (
				data?.message !== "SSO_TOKEN_RESPONSE" &&
				data?.type !== "SSO_TOKEN_RESPONSE"
			)
				return;

			const { ssoToken, companyId, locationId, error } = data;

			if (error || !ssoToken) {
				console.error(
					"[GHLSSOProvider] SSO error:",
					error || "missing ssoToken",
				);
				finish(commitFallback);
				return;
			}

			// GHL sends company/location either as a plain string or as { id }.
			const company_id =
				typeof companyId === "string" ? companyId : companyId?.id || "";
			const location_id =
				typeof locationId === "string" ? locationId : locationId?.id || "";

			finish(() =>
				commit({
					ssoToken,
					appKey: APP_KEY,
					companyId: company_id,
					locationId: location_id,
					appId: APP_ID,
				}),
			);
		};

		window.addEventListener("message", handleMessage);
		window.parent.postMessage(
			{ message: "REQUEST_SSO_TOKEN", appId: APP_ID },
			"*",
		);

		// No response in time → don't freeze on the spinner; fall back to the
		// defaults. Once /api/verify-me is wired, gate hydration on a 2xx from
		// it and redirect to /unauthorized here instead.
		const timeout = window.setTimeout(() => {
			finish(() => {
				console.warn(
					"[GHLSSOProvider] SSO handshake timed out — using fallback context.",
				);
				commitFallback();
			});
		}, SSO_TIMEOUT_MS);

		return () => {
			window.clearTimeout(timeout);
			window.removeEventListener("message", handleMessage);
		};
	}, [commit, commitFallback]);

	if (!ctx.hydrated) {
		return (
			<div
				style={{
					position: "fixed",
					inset: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#fff",
					zIndex: 9999,
				}}
			>
				<div
					style={{
						width: 48,
						height: 48,
						border: "4px solid #e5e7eb",
						borderTopColor: "#3b82f6",
						borderRadius: "50%",
						animation: "jdf-sso-spin 1s linear infinite",
					}}
				/>
				<style>{`@keyframes jdf-sso-spin { to { transform: rotate(360deg); } }`}</style>
			</div>
		);
	}

	return <>{children}</>;
}
