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
} from "../Atoms/levelMode";
import { useSubaccounts } from "../services/api";

/*
 * Scope selector — a single compact dropdown that replaces the old
 * segmented toggle + separate subaccount picker.
 *
 * Why one control: the toggle + picker + the navbar's other actions could
 * not all fit on small screens, and the icon-only toggle didn't convey its
 * purpose. A single button that shows the CURRENT scope by name ("Agency" or
 * the subaccount name) with a chevron is unambiguous and stays compact at any
 * width. Opening it reveals the Agency option + a searchable subaccount list.
 *
 * All level/URL logic is unchanged — only the presentation is consolidated.
 */
const LevelSwitcher = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [level, setLevel] = useRecoilState(levelModeAtom);
	const { subaccounts, isLoading, error } = useSubaccounts();

	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

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
	// (e.g. they switched while the list was still loading), pick the first
	// subaccount automatically.
	useEffect(() => {
		if (level.mode !== "subaccount") return;
		if (level.subaccountId) return;
		if (subaccounts.length === 0) return;
		const next = new URLSearchParams(searchParams);
		next.set(SUBACCOUNT_PARAM, subaccounts[0].id);
		setSearchParams(next);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [level.mode, level.subaccountId, subaccounts]);

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

	const isAgency = level.mode === "agency";
	const selectedSub = getSubaccountById(level.subaccountId, subaccounts);
	// What the trigger button shows — the CURRENT scope, named.
	const triggerLabel = isAgency
		? "Agency"
		: selectedSub?.name ?? level.subaccountId ?? "Subaccount";

	const chooseAgency = () => {
		writeMode("agency");
		setOpen(false);
	};
	const chooseSubaccount = (id: string) => {
		writeMode("subaccount", id);
		setOpen(false);
	};

	return (
		<PopoverRoot
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
			positioning={{ placement: "bottom-end", gutter: 6 }}
			initialFocusEl={() => inputRef.current}
		>
			<PopoverTrigger asChild>
				<Button
					size="sm"
					variant="outline"
					h="36px"
					px={3}
					gap={2}
					minW={0}
					maxW={{ base: "150px", sm: "190px", md: "220px" }}
					borderRadius="full"
					borderColor="gray.300"
					bg="white"
					color="ink.700"
					_hover={{ bg: "gray.50", borderColor: "gray.400" }}
					aria-label="Switch level or subaccount"
					flexShrink={1}
				>
					<Box color={isAgency ? "ink.500" : "brand.600"} flexShrink={0}>
						{isAgency ? <LuBuilding2 /> : <LuUser />}
					</Box>
					<Text as="span" truncate fontSize="sm" fontWeight="semibold">
						{triggerLabel}
					</Text>
					<Box flexShrink={0} color="ink.400">
						<LuChevronDown />
					</Box>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				width={{ base: "240px", md: "300px" }}
				maxW="calc(100vw - 20px)"
				p={0}
				borderRadius="xl"
				boxShadow="lg"
				border="1px solid"
				borderColor="gray.200"
				overflow="hidden"
			>
				<PopoverBody p={0}>
					{/* Level: Agency */}
					<Box px={3} pt={3} pb={2}>
						<Text
							fontSize="2xs"
							textTransform="uppercase"
							letterSpacing="wider"
							color="ink.400"
							fontWeight="bold"
							mb={1.5}
							px={1}
						>
							Level
						</Text>
						<Box
							role="button"
							onClick={chooseAgency}
							cursor="pointer"
							px={2.5}
							py={2}
							borderRadius="lg"
							bg={isAgency ? "brand.50" : "transparent"}
							_hover={{ bg: isAgency ? "brand.100" : "gray.50" }}
							display="flex"
							alignItems="center"
							gap={2.5}
						>
							<Box color={isAgency ? "brand.600" : "ink.500"} flexShrink={0}>
								<LuBuilding2 />
							</Box>
							<Text
								flex={1}
								fontSize="sm"
								fontWeight={isAgency ? "semibold" : "medium"}
								color="ink.800"
							>
								Switch to Agency
							</Text>
							{isAgency && (
								<Box color="brand.600" flexShrink={0}>
									<LuCheck />
								</Box>
							)}
						</Box>
					</Box>

					{/* Subaccounts */}
					<Box
						px={3}
						pt={1.5}
						pb={2}
						borderTop="1px solid"
						borderColor="gray.100"
					>
						<Text
							fontSize="2xs"
							textTransform="uppercase"
							letterSpacing="wider"
							color="ink.400"
							fontWeight="bold"
							mb={1.5}
							px={1}
						>
							Subaccount
						</Text>
						<Input
							ref={inputRef}
							size="xs"
							placeholder="Search subaccounts…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							borderColor="gray.200"
							borderRadius="lg"
							_focus={{
								borderColor: "#4f46e5",
								boxShadow: "0 0 0 1px #4f46e5",
							}}
						/>
					</Box>

					<Box maxH="240px" overflowY="auto" px={3} pb={3}>
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
								const isActive =
									!isAgency && sub.id === level.subaccountId;
								return (
									<Box
										key={sub.id}
										onClick={() => chooseSubaccount(sub.id)}
										role="button"
										cursor="pointer"
										px={2.5}
										py={2}
										borderRadius="lg"
										bg={isActive ? "brand.50" : "transparent"}
										_hover={{ bg: isActive ? "brand.100" : "gray.50" }}
										display="flex"
										justifyContent="space-between"
										alignItems="center"
										gap={2}
									>
										<HStack gap={2.5} minW={0} flex={1}>
											<Box
												color={isActive ? "brand.600" : "ink.400"}
												flexShrink={0}
											>
												<LuUser />
											</Box>
											<Stack gap={0} minW={0} flex={1}>
												<Text
													fontSize="sm"
													fontWeight={isActive ? "semibold" : "medium"}
													color="ink.800"
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
										</HStack>
										{isActive && (
											<Box color="brand.600" flexShrink={0}>
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

export default LevelSwitcher;
