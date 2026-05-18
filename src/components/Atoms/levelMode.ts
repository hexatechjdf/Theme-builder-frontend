import { atom } from "recoil";

export type LevelMode = "agency" | "subaccount";

export interface LevelModeState {
	mode: LevelMode;
	subaccountId: string | null;
}

export interface Subaccount {
	id: string;
	name: string;
}

// URL search-param key. Presence implies subaccount mode; absence is agency.
export const SUBACCOUNT_PARAM = "subaccount_id";

// Static placeholder list. Replace with API data when available.
export const DUMMY_SUBACCOUNTS: Subaccount[] = [
	{ id: "loc_001", name: "Acme Corporation" },
	{ id: "loc_002", name: "Beta Industries" },
	{ id: "loc_003", name: "Cypher Labs" },
	{ id: "loc_004", name: "Delta Marketing" },
	{ id: "loc_005", name: "Echo Solutions" },
	{ id: "loc_006", name: "Foxtrot Agency" },
	{ id: "loc_007", name: "Golden Gate Partners" },
	{ id: "loc_008", name: "Helios Consulting" },
	{ id: "loc_009", name: "Indigo Studios" },
	{ id: "loc_010", name: "Juniper & Co" },
	{ id: "loc_011", name: "Kestrel Group" },
	{ id: "loc_012", name: "Lumen Digital" },
	{ id: "loc_013", name: "Meridian Works" },
	{ id: "loc_014", name: "Nexus Holdings" },
	{ id: "loc_015", name: "Orion Systems" },
];

export const getSubaccountById = (
	id: string | null,
	list: Subaccount[]
): Subaccount | undefined =>
	id ? list.find((s) => s.id === id) : undefined;

export const levelModeAtom = atom<LevelModeState>({
	key: "levelMode",
	default: { mode: "agency", subaccountId: null },
});
