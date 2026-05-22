import { useState } from "react";
import {
	Box,
	Dialog,
	Flex,
	Portal,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuRocket } from "react-icons/lu";
import { Button } from "../ui/button";
import { CloseButton } from "../ui/close-button";
import { usePublishThemeToLive } from "../services/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { saveActivityAtom } from "../Atoms/saveActivityAtom";
import { levelModeAtom } from "../Atoms/levelMode";
import { toast } from "react-toastify";
import { notifyChangedListChanged } from "../store/changedListStore";
import { useChangedList } from "../hooks/useChangedList";
import { runActiveSave } from "../store/saveBus";
import { brand } from "../../theme";
import store from "store2";

// Turn a changed-field key ("--jdf-primary-color", "animation") into a
// human-readable label ("Primary Color", "Animation").
const formatKey = (key: string): string => {
	const cleaned = key
		.replace(/^--/, "")
		.replace(/^jdf-/i, "")
		.replace(/[-_]/g, " ")
		.trim();
	const titled = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
	return titled || key;
};

// Best-effort CSS-renderable colour for the swatch preview, or null if the
// value isn't a colour (text/number/url/etc.). Handles #hex, rgb()/hsl(), and
// the raw "r, g, b" tuple the backend stores for rgb-format fields.
const previewColor = (value: string): string | null => {
	const v = (value || "").trim();
	if (!v) return null;
	if (/^#([0-9a-f]{3,8})$/i.test(v)) return v;
	if (/^(rgb|hsl)a?\(/i.test(v)) return v;
	if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}/.test(v)) return `rgb(${v})`;
	return null;
};

interface ChangeRow {
	key: string;
	label: string;
	value: string;
	color: string | null;
}

const PublishMenu = () => {
	const setPublishStatus = useSetRecoilState(publishStatusAtom);
	const setSaveActivity = useSetRecoilState(saveActivityAtom);
	const level = useRecoilValue(levelModeAtom);
	const { hasChanges } = useChangedList();

	const publishThemeMutation = usePublishThemeToLive();
	const { isLoading } = publishThemeMutation;

	const [open, setOpen] = useState(false);
	const [isAutoSaving, setIsAutoSaving] = useState(false);
	const [changes, setChanges] = useState<ChangeRow[]>([]);

	// Snapshot the unsaved changes so the confirm dialog can show what the
	// user is about to push live.
	const openConfirm = () => {
		const list = (store("changedList") as string[]) || [];
		setChanges(
			list.map((key) => {
				const value = String(store(key) ?? "");
				return { key, label: formatKey(key), value, color: previewColor(value) };
			})
		);
		setOpen(true);
	};

	const doPublish = async () => {
		setOpen(false);
		const locationId =
			level.mode === "subaccount"
				? level.subaccountId ?? "agency"
				: "agency";

		// Auto-save any unsaved edits first — publish only promotes the saved
		// draft to live, so unsaved local edits would otherwise be left behind.
		if (hasChanges) {
			setIsAutoSaving(true);
			try {
				const saved = await runActiveSave();
				setIsAutoSaving(false);
				if (!saved) return; // save failed / propagation cancelled → abort
			} catch (err) {
				console.error("Auto-save before publish failed:", err);
				setIsAutoSaving(false);
				return;
			}
		}

		setSaveActivity("publishing");
		publishThemeMutation.mutate(
			{ from: "draft", to: "live", locationId } as any,
			{
				onSuccess: () => {
					toast.success("Theme published successfully");
					setPublishStatus("live");
					notifyChangedListChanged();
				},
				onError: (err: any) => {
					toast.warn(
						err?.response?.data?.message ||
							err?.message ||
							"Something went wrong"
					);
				},
				onSettled: () => {
					setSaveActivity("idle");
				},
			}
		);
	};

	const renderButtonContent = () => {
		if (isAutoSaving) {
			return (
				<>
					<Spinner size="sm" mr="2" /> Saving…
				</>
			);
		}
		if (isLoading) {
			return (
				<>
					<Spinner size="sm" mr="2" /> Publishing…
				</>
			);
		}
		return (
			<>
				<LuRocket size={15} /> Publish
			</>
		);
	};

	return (
		<>
			<Button
				onClick={openConfirm}
				disabled={isAutoSaving || isLoading}
				bg="brand.600"
				color="white"
				_hover={{ bg: "brand.700" }}
				_active={{ bg: "brand.800" }}
				borderRadius="10px"
				h="36px"
				minH="36px"
				px={{ base: 3.5, md: 4 }}
				py={0}
				fontWeight="semibold"
				fontSize="sm"
				boxShadow={brand.shadow}
				transition="all 0.2s"
				flexShrink={0}
				gap={1.5}
			>
				{renderButtonContent()}
			</Button>

			<Dialog.Root
				open={open}
				onOpenChange={(d) => setOpen(d.open)}
				placement="center"
				motionPreset="slide-in-bottom"
			>
				<Portal>
					<Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
					<Dialog.Positioner>
						<Dialog.Content
							w={{ base: "92vw", md: "460px" }}
							maxH="86vh"
							borderRadius="2xl"
							overflow="hidden"
							display="flex"
							flexDirection="column"
						>
							<Dialog.Header
								px={{ base: 5, md: 6 }}
								py={4}
								borderBottom="1px solid"
								borderColor="ink.100"
							>
								<Flex align="center" gap={3} w="100%">
									<Flex
										align="center"
										justify="center"
										boxSize="40px"
										borderRadius="11px"
										bgImage={brand.gradient}
										color="white"
										flexShrink={0}
										boxShadow={brand.shadow}
									>
										<LuRocket size={20} />
									</Flex>
									<Stack gap={0} flex={1} minW={0}>
										<Dialog.Title
											fontSize="lg"
											fontWeight="bold"
											color="ink.900"
										>
											Publish to live?
										</Dialog.Title>
										<Text fontSize="sm" color="ink.500">
											These changes will go live for your users.
										</Text>
									</Stack>
									<Dialog.CloseTrigger asChild>
										<CloseButton size="sm" />
									</Dialog.CloseTrigger>
								</Flex>
							</Dialog.Header>

							<Dialog.Body px={{ base: 5, md: 6 }} py={4} overflowY="auto">
								{changes.length > 0 ? (
									<Stack gap={2}>
										<Text
											fontSize="xs"
											fontWeight="bold"
											textTransform="uppercase"
											letterSpacing="wider"
											color="ink.400"
										>
											{changes.length}{" "}
											{changes.length === 1 ? "change" : "changes"}
										</Text>
										{changes.map((c) => (
											<Flex
												key={c.key}
												align="center"
												justify="space-between"
												gap={3}
												px={3}
												py={2.5}
												borderRadius="lg"
												bg="ink.50"
												border="1px solid"
												borderColor="ink.200"
											>
												<Text
													fontSize="sm"
													fontWeight="medium"
													color="ink.800"
													truncate
												>
													{c.label}
												</Text>
												<Flex
													align="center"
													gap={2}
													flexShrink={0}
													minW={0}
												>
													{c.color && (
														<Box
															boxSize="20px"
															rounded="6px"
															border="1px solid"
															borderColor="ink.200"
															flexShrink={0}
															style={{ background: c.color }}
														/>
													)}
													<Text
														fontSize="xs"
														color="ink.500"
														fontFamily="mono"
														truncate
														maxW="150px"
													>
														{c.value}
													</Text>
												</Flex>
											</Flex>
										))}
									</Stack>
								) : (
									<Text fontSize="sm" color="ink.600" lineHeight="1.6">
										Your saved draft will be published live. There
										are no unsaved edits pending.
									</Text>
								)}
							</Dialog.Body>

							<Dialog.Footer
								px={{ base: 5, md: 6 }}
								py={4}
								gap={2.5}
								borderTop="1px solid"
								borderColor="ink.100"
								flexDirection={{ base: "column-reverse", sm: "row" }}
							>
								<Button
									variant="outline"
									borderColor="ink.300"
									color="ink.700"
									onClick={() => setOpen(false)}
									w={{ base: "100%", sm: "auto" }}
									flex={{ base: "none", sm: 1 }}
								>
									Cancel
								</Button>
								<Button
									colorPalette="brand"
									onClick={doPublish}
									gap={1.5}
									fontWeight="semibold"
									w={{ base: "100%", sm: "auto" }}
									flex={{ base: "none", sm: 1 }}
								>
									<LuRocket size={15} />
									Publish Now
								</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</>
	);
};

export default PublishMenu;
