import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { useNavigate, type To } from "react-router-dom";
import { useChangedList } from "../hooks/useChangedList";
import LeaveConfirmModal from "../Molecules/LeaveConfirmModal";

// Optional callback run once the navigation is actually committed (either
// there were no unsaved changes, or the user confirmed the leave). Used by
// the navbar to sync its tab state only when the move really happens.
type ProceedFn = () => void;

interface NavigationGuardValue {
	/**
	 * Navigate, but if the current page holds unsaved theme edits, ask the
	 * user to confirm first. Use this for every in-app navigation that would
	 * leave a dirty page (navbar tabs, logo, …).
	 */
	guardedNavigate: (to: To, onProceed?: ProceedFn) => void;
}

const NavigationGuardContext = createContext<NavigationGuardValue | null>(null);

interface PendingNav {
	to: To;
	onProceed?: ProceedFn;
}

/**
 * Provides unsaved-changes protection for everything it wraps:
 *
 *  • In-app navigation (navbar tabs, logo) — `guardedNavigate` intercepts
 *    the route change and shows the branded `LeaveConfirmModal`.
 *  • Genuine tab-close / reload — a `beforeunload` handler triggers the
 *    browser's native prompt. This case CANNOT use a custom popup: the
 *    page is being destroyed, so no React UI can render. The native prompt
 *    is the only warning a browser permits there.
 *
 * Note: the app uses `<BrowserRouter>` (a non-data router), so react-router's
 * `useBlocker` is unavailable — in-app guarding is done at the navigation
 * call site via `guardedNavigate` instead.
 */
export const NavigationGuardProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const navigate = useNavigate();
	const { hasChanges } = useChangedList();
	const [pending, setPending] = useState<PendingNav | null>(null);

	// Keep the latest `hasChanges` in a ref so the once-bound `beforeunload`
	// handler — and the stable `guardedNavigate` callback — always read the
	// current value without re-registering.
	const hasChangesRef = useRef(hasChanges);
	hasChangesRef.current = hasChanges;

	// ── Browser-level guard: genuine tab-close / reload ──
	// Triggers the browser's native confirmation prompt. A custom popup is
	// impossible here — the document is being torn down, so no React UI can
	// render — this native prompt is the only warning the browser allows.
	useEffect(() => {
		const handler = (event: BeforeUnloadEvent) => {
			if (!hasChangesRef.current) return;
			event.preventDefault();
			// Legacy browsers require returnValue to be set to trigger the
			// native confirmation prompt.
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, []);

	// ── In-app guard: navbar tabs / logo navigation ──
	const guardedNavigate = useCallback(
		(to: To, onProceed?: ProceedFn) => {
			if (hasChangesRef.current) {
				// Hold the navigation — the modal resolves it.
				setPending({ to, onProceed });
			} else {
				navigate(to);
				onProceed?.();
			}
		},
		[navigate],
	);

	const confirmLeave = useCallback(() => {
		if (!pending) return;
		const { to, onProceed } = pending;
		setPending(null);
		navigate(to);
		onProceed?.();
	}, [pending, navigate]);

	const cancelLeave = useCallback(() => setPending(null), []);

	// Memoised so consumers (the navbar) don't re-render every time the
	// provider re-renders on a `changedList` change — `guardedNavigate` is
	// already stable.
	const value = useMemo(() => ({ guardedNavigate }), [guardedNavigate]);

	return (
		<NavigationGuardContext.Provider value={value}>
			{children}
			<LeaveConfirmModal
				open={pending !== null}
				onConfirm={confirmLeave}
				onCancel={cancelLeave}
			/>
		</NavigationGuardContext.Provider>
	);
};

export const useNavigationGuard = (): NavigationGuardValue => {
	const ctx = useContext(NavigationGuardContext);
	if (!ctx) {
		throw new Error(
			"useNavigationGuard must be used within a NavigationGuardProvider",
		);
	}
	return ctx;
};
