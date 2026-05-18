import { useEffect, useMemo, useRef, useState } from "react";
import {
	Box,
	Button,
	HStack,
	Input,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuBuilding2, LuChevronDown, LuCheck, LuUser } from "react-icons/lu";
import { useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { toast } from "react-toastify";
import {
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "../ui/popover";
import {
	LevelMode,
	getSubaccountById,
	levelModeAtom,
	SUBACCOUNT_PARAM,
	Subaccount,
} from "../Atoms/levelMode";
import { useSubaccounts } from "../services/api";

interface SubaccountPickerProps {
	selectedId: string | null;
	onSelect: (id: string) => void;
	subaccounts: Subaccount[];
	isLoading: boolean;
	error: Error | null;
}

const SubaccountPicker: React.FC<SubaccountPickerProps> = ({
	selectedId,
	onSelect,
	subaccounts,
	isLoading,
	error,
}) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const selected = getSubaccountById(selectedId, subaccounts);
	const buttonLabel = selected?.name ?? selectedId ?? "Select subaccount";

	// Focus the search input when the popover opens; clear search when it closes.
	useEffect(() => {
		if (open) {
			requestAnimationFrame(() => inputRef.current?.focus());
		} else {
			setSearch("");
		}
	}, [open]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return subaccounts;
		return subaccounts.filter(
			(s) =>
				s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
		);
	}, [search, subaccounts]);

	const pick = (sub: Subaccount) => {
		onSelect(sub.id);
		setOpen(false);
	};

	return (
		<PopoverRoot
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
			positioning={{ placement: "bottom-start", gutter: 4 }}
			initialFocusEl={() => inputRef.current}
		>
			<PopoverTrigger asChild>
				<Button
					size="xs"
					variant="outline"
					borderRadius="full"
					borderColor="gray.300"
					color="gray.700"
					_hover={{ bg: "gray.50" }}
					maxW={{ base: "140px", sm: "180px", md: "240px" }}
					gap={1.5}
					px={3}
					aria-label="Select subaccount"
				>
					<LuUser />
					<Text as="span" truncate fontSize="xs" fontWeight="semibold">
						{buttonLabel}
					</Text>
					<LuChevronDown />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				width={{ base: "260px", md: "300px" }}
				maxW="calc(100vw - 32px)"
				p={0}
				borderRadius="md"
				boxShadow="lg"
				border="1px solid"
				borderColor="gray.200"
				overflow="hidden"
			>
				<PopoverBody p={0}>
					<Box p={2} borderBottom="1px solid" borderColor="gray.100">
						<Input
							ref={inputRef}
							size="xs"
							placeholder="Search subaccounts..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							borderColor="gray.200"
							_focus={{
								borderColor: "#735DFF",
								boxShadow: "0 0 0 1px #735DFF",
							}}
						/>
					</Box>

					<Box maxH="260px" overflowY="auto">
						{isLoading ? (
							<HStack p={3} fontSize="sm" color="gray.500" justify="center" gap={2}>
								<Spinner size="xs" />
								<Text as="span">Loading subaccounts…</Text>
							</HStack>
						) : error ? (
							<Box p={3} fontSize="sm" color="red.500" textAlign="center">
								Failed to load subaccounts
							</Box>
						) : subaccounts.length === 0 ? (
							<Box p={3} fontSize="sm" color="gray.500" textAlign="center">
								No subaccounts found
							</Box>
						) : filtered.length === 0 ? (
							<Box p={3} fontSize="sm" color="gray.500" textAlign="center">
								No subaccounts match
							</Box>
						) : (
							filtered.map((sub) => {
								const isActive = sub.id === selectedId;
								return (
									<Box
										key={sub.id}
										onClick={() => pick(sub)}
										role="button"
										cursor="pointer"
										px={3}
										py={2}
										bg={isActive ? "purple.50" : "transparent"}
										_hover={{ bg: isActive ? "purple.100" : "gray.50" }}
										display="flex"
										justifyContent="space-between"
										alignItems="center"
										gap={2}
									>
										<Stack gap={0} minW={0} flex={1}>
											<Text
												fontSize="sm"
												fontWeight={isActive ? "semibold" : "medium"}
												color="gray.800"
												truncate
											>
												{sub.name}
											</Text>
											<Text
												fontSize="xs"
												color="gray.500"
												fontFamily="mono"
												truncate
											>
												{sub.id}
											</Text>
										</Stack>
										{isActive && (
											<Box color="#735DFF" flexShrink={0}>
												<LuCheck />
											</Box>
										)}
									</Box>
								);
							})
						)}
					</Box>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
	);
};

const LevelSwitcher = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [level, setLevel] = useRecoilState(levelModeAtom);
	const { subaccounts, isLoading, error } = useSubaccounts();

	// URL → atom (URL is the source of truth). Param PRESENCE (not value) marks
	// subaccount mode — so we can enter the mode before the list has loaded.
	useEffect(() => {
		const hasParam = searchParams.has(SUBACCOUNT_PARAM);
		const subId = searchParams.get(SUBACCOUNT_PARAM);
		const next: { mode: LevelMode; subaccountId: string | null } = hasParam
			? { mode: "subaccount", subaccountId: subId || null }
			: { mode: "agency", subaccountId: null };

		if (next.mode !== level.mode || next.subaccountId !== level.subaccountId) {
			setLevel(next);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// Toast once when the subaccount fetch fails.
	useEffect(() => {
		if (error) toast.error("Failed to load subaccounts");
	}, [error]);

	const writeMode = (mode: LevelMode, subaccountId?: string) => {
		const next = new URLSearchParams(searchParams);
		if (mode === "subaccount") {
			// Param presence marks subaccount mode; the value may be empty until
			// the API returns and the effect below picks the first subaccount.
			const value = subaccountId ?? level.subaccountId ?? subaccounts[0]?.id ?? "";
			next.set(SUBACCOUNT_PARAM, value);
		} else {
			next.delete(SUBACCOUNT_PARAM);
		}
		setSearchParams(next);
	};

	// Once subaccounts arrive, if the user is in subaccount mode without an id
	// (e.g. they clicked the toggle while the list was still loading), pick the
	// first subaccount automatically.
	useEffect(() => {
		if (level.mode !== "subaccount") return;
		if (level.subaccountId) return;
		if (subaccounts.length === 0) return;
		const next = new URLSearchParams(searchParams);
		next.set(SUBACCOUNT_PARAM, subaccounts[0].id);
		setSearchParams(next);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [level.mode, level.subaccountId, subaccounts]);

	const pill = (active: boolean) => ({
		size: "xs" as const,
		bg: active ? "#735DFF" : "transparent",
		color: active ? "white" : "gray.600",
		_hover: {
			bg: active ? "#5b48d9" : "gray.200",
		},
		borderRadius: "full",
		px: { base: 2, sm: 3 },
		fontWeight: "semibold" as const,
		fontSize: "xs" as const,
		minW: { base: "32px", sm: "auto" },
	});

	return (
		<HStack gap={2} align="center" flexShrink={0}>
			<HStack
				bg="gray.100"
				borderRadius="full"
				p="3px"
				gap="2px"
				border="1px solid"
				borderColor="gray.200"
			>
				<Button
					{...pill(level.mode === "agency")}
					onClick={() => writeMode("agency")}
					aria-label="Switch to Agency level"
				>
					<LuBuilding2 />
					<Text as="span" display={{ base: "none", sm: "inline" }} ml={1.5}>
						Agency
					</Text>
				</Button>
				<Button
					{...pill(level.mode === "subaccount")}
					onClick={() => writeMode("subaccount")}
					aria-label="Switch to Subaccount level"
				>
					<LuUser />
					<Text as="span" display={{ base: "none", sm: "inline" }} ml={1.5}>
						Subaccount
					</Text>
				</Button>
			</HStack>

			{level.mode === "subaccount" && (
				<SubaccountPicker
					selectedId={level.subaccountId}
					onSelect={(id) => writeMode("subaccount", id)}
					subaccounts={subaccounts}
					isLoading={isLoading}
					error={error as Error | null}
				/>
			)}
		</HStack>
	);
};

export default LevelSwitcher;
