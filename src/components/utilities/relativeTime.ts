// Frontend-only "time ago" formatter for the save-status timestamp. Kept
// dependency-free and deliberately coarse — it's a reassurance signal, not a
// precise clock. Returns "" for a missing/invalid timestamp so callers can
// simply skip rendering the detail.
export const formatRelativeTime = (ts: number | null | undefined): string => {
	if (typeof ts !== "number" || !Number.isFinite(ts)) return "";

	const diffMs = Date.now() - ts;
	if (diffMs < 0) return "just now";

	const sec = Math.floor(diffMs / 1000);
	if (sec < 45) return "just now";

	const min = Math.floor(sec / 60);
	if (min < 1) return "just now";
	if (min === 1) return "1 min ago";
	if (min < 60) return `${min} min ago`;

	const hr = Math.floor(min / 60);
	if (hr === 1) return "1 hr ago";
	if (hr < 24) return `${hr} hr ago`;

	const day = Math.floor(hr / 24);
	if (day === 1) return "yesterday";
	if (day < 7) return `${day} days ago`;

	return new Date(ts).toLocaleDateString();
};
