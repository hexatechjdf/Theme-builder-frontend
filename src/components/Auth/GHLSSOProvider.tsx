import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRecoilState } from "recoil";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { LuShieldAlert } from "react-icons/lu";
import { ghlContextAtom, type GhlContext } from "../Atoms/ghlContext";
import { setGhlRuntimeContext } from "../utilities/ghlRuntimeContext";
import {
	SSO_TOKEN,
	APP_KEY,
	APP_ID,
	DEV_COMPANY_ID,
	IS_LOCAL_DEV,
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
	// Set ONLY on a live host when no valid SSO token can be obtained — drives
	// the "Session not verified" screen. On local dev we never set this; we
	// use the hardcoded dev token instead.
	const [authError, setAuthError] = useState(false);

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

	// Commit the hardcoded appHeaders dev token. LOCAL DEV ONLY.
	const commitDevFallback = useCallback(() => {
		commit({
			ssoToken: SSO_TOKEN,
			appKey: APP_KEY,
			companyId: DEV_COMPANY_ID,
			locationId: "",
			appId: APP_ID,
		});
	}, [commit]);

	// No usable SSO token (not embedded / handshake error / timeout).
	//   • Local dev → fall back to the hardcoded dev token so dev flows work.
	//   • Live host → DO NOT use the hardcoded token. Surface a clear
	//     "Session not verified" screen instead.
	const handleNoSso = useCallback(
		(reason: string) => {
			if (IS_LOCAL_DEV) {
				commitDevFallback();
				return;
			}
			console.error(
				"[GHLSSOProvider] No valid SSO token on a live host — refusing the hardcoded fallback:",
				reason,
			);
			setAuthError(true);
		},
		[commitDevFallback],
	);

	useEffect(() => {
		// Not embedded in a parent frame → local dev / direct page load.
		// There's no GHL parent to handshake with. Local dev gets the dev
		// token; a live direct-load has no SSO source → "not verified".
		if (window.parent === window) {
			handleNoSso("App is not embedded in the CRM iframe.");
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
				finish(() => handleNoSso(error || "missing ssoToken"));
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

		// No response in time → don't freeze on the spinner. Local dev gets
		// the dev token; a live host shows "Session not verified".
		const timeout = window.setTimeout(() => {
			finish(() => handleNoSso("SSO handshake timed out."));
		}, SSO_TIMEOUT_MS);

		return () => {
			window.clearTimeout(timeout);
			window.removeEventListener("message", handleMessage);
		};
	}, [commit, handleNoSso]);

	// Live host, no verifiable SSO token → block the app with a clear message
	// instead of silently authenticating with the hardcoded dev token.
	if (authError) {
		return (
			<Flex minH="100vh" align="center" justify="center" p={6} bg="#e2e4ec">
				<Box
					bg="white"
					borderRadius="2xl"
					boxShadow="0 20px 50px -12px rgba(43, 34, 107, 0.25)"
					p={{ base: 8, md: 10 }}
					maxW="440px"
					textAlign="center"
				>
					<Flex
						align="center"
						justify="center"
						boxSize="64px"
						borderRadius="full"
						bg="#FEE2E2"
						color="#DC2626"
						mx="auto"
						mb={5}
					>
						<LuShieldAlert size={30} />
					</Flex>
					<Text fontSize="xl" fontWeight="bold" color="#0f172a" mb={2}>
						Session not verified
					</Text>
					<Text
						fontSize="sm"
						color="#475569"
						lineHeight="1.65"
						mb={6}
					>
						We couldn't verify your CRM session. Please close this and
						reopen Theme Builder from inside your CRM. If the problem
						continues, contact support.
					</Text>
					<Button
						onClick={() => window.location.reload()}
						colorPalette="brand"
						borderRadius="lg"
						w="full"
						fontWeight="semibold"
					>
						Try again
					</Button>
				</Box>
			</Flex>
		);
	}

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
						borderTopColor: "#4f46e5",
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
