import { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	Flex,
	Portal,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuArrowRight, LuLink2, LuLink2Off, LuPalette } from "react-icons/lu";
import { Checkbox } from "../ui/checkbox";
import { CloseButton } from "../ui/close-button";
import type { SchemaField } from "../Dictionaries/themeSchema";

// One entry per parent variable that was edited in this session AND has
// any children (fields whose `baseRoot` points at it).
export interface LinkPropagationGroup {
	parentKey: string;
	parentLabel: string;
	parentNewColor: string;
	children: Array<{
		field: SchemaField;
		initiallyLinked: boolean;
		/** CSS-renderable color the variable currently displays. */
		oldColor: string;
		/** CSS-renderable color the variable will become if kept linked. */
		newColor: string;
	}>;
}

interface Props {
	open: boolean;
	groups: LinkPropagationGroup[];
	onConfirm: (decisions: Record<string, boolean>) => void;
	onCancel: () => void;
}

interface ChildRow {
	field: SchemaField;
	initiallyLinked: boolean;
	oldColor: string;
	newColor: string;
}

const ACCENT = "#735DFF";
const ACCENT_HOVER = "#5b48d9";
const ACCENT_SOFT = "rgba(115, 93, 255, 0.08)";
const ACCENT_SOFT_STRONG = "rgba(115, 93, 255, 0.13)";
const ACCENT_BORDER = "rgba(115, 93, 255, 0.30)";
const SWATCH_SIZE = "42px";

// A labelled color chip — the basic visual unit of the before/after pair.
const ColorTile: React.FC<{
	color: string;
	caption: string;
	captionColor: string;
	dim?: boolean;
}> = ({ color, caption, captionColor, dim }) => (
	<Stack gap={1.5} align="center" flexShrink={0}>
		<Box
			boxSize={SWATCH_SIZE}
			borderRadius="10px"
			border="2px solid white"
			boxShadow="0 0 0 1px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(0, 0, 0, 0.10)"
			style={{ background: color || "#e5e7eb" }}
			opacity={dim ? 0.35 : 1}
			transition="opacity 0.15s ease, background 0.2s ease"
		/>
		<Text
			fontSize="2xs"
			fontWeight="bold"
			textTransform="uppercase"
			letterSpacing="0.07em"
			color={captionColor}
			lineHeight="1"
		>
			{caption}
		</Text>
	</Stack>
);

const LinkPropagationDialog: React.FC<Props> = ({
	open,
	groups,
	onConfirm,
	onCancel,
}) => {
	// Flatten and de-dupe by field.key — a child that's linked via a
	// multi-parent gradient should appear once.
	const rows = useMemo<ChildRow[]>(() => {
		const seen = new Set<string>();
		const out: ChildRow[] = [];
		groups.forEach((g) => {
			g.children.forEach((c) => {
				if (seen.has(c.field.key)) return;
				seen.add(c.field.key);
				out.push(c);
			});
		});
		return out;
	}, [groups]);

	// All rows default to checked (keep linked); the user unchecks any they
	// want to detach.
	const [decisions, setDecisions] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!open) return;
		const initial: Record<string, boolean> = {};
		rows.forEach((c) => {
			initial[c.field.key] = true;
		});
		setDecisions(initial);
	}, [open, rows]);

	const handleApply = () => onConfirm(decisions);

	const toggle = (key: string) =>
		setDecisions((prev) => ({ ...prev, [key]: !prev[key] }));

	// Live count, drives the summary line so the user always knows the net
	// effect of their current selection before they hit Apply.
	const total = rows.length;
	const changedCount = rows.reduce(
		(n, r) => n + (decisions[r.field.key] ? 1 : 0),
		0,
	);
	const summary =
		changedCount === 0
			? "Every color will be kept as it is"
			: changedCount === total
				? `All ${total} linked color${total === 1 ? "" : "s"} will update`
				: `${changedCount} of ${total} linked colors will update`;

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(d) => {
				if (!d.open) onCancel();
			}}
			placement="center"
			motionPreset="slide-in-bottom"
		>
			<Portal>
				<Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
				<Dialog.Positioner>
					<Dialog.Content
						w={{ base: "95vw", md: "560px" }}
						maxW="620px"
						borderRadius="xl"
						boxShadow="2xl"
						overflow="hidden"
					>
						<Dialog.Header
							px={{ base: 5, md: 6 }}
							py={4}
							borderBottom="1px solid"
							borderColor="gray.100"
						>
							<Flex justify="space-between" align="flex-start" gap={3}>
								<Flex
									align="center"
									justify="center"
									boxSize="38px"
									borderRadius="10px"
									bg={ACCENT_SOFT}
									color={ACCENT}
									flexShrink={0}
								>
									<LuLink2 size={19} />
								</Flex>
								<Box minW={0} flex={1}>
									<Dialog.Title
										fontSize={{ base: "md", md: "lg" }}
										fontWeight="bold"
										color="gray.900"
										lineHeight="1.3"
									>
										Update linked colors?
									</Dialog.Title>
									<Text fontSize="xs" color="gray.500" mt={1}>
										The colors below are linked to the one you just
										changed and will follow it. Uncheck any you want to
										keep as-is.
									</Text>
								</Box>
								<Dialog.CloseTrigger>
									<CloseButton size="sm" />
								</Dialog.CloseTrigger>
							</Flex>
						</Dialog.Header>

						<Dialog.Body
							px={{ base: 4, md: 5 }}
							py={4}
							maxH="65vh"
							overflowY="auto"
						>
							<Stack gap={3}>
								{/* What the user changed — the cause. Anchors the
								    whole dialog so the "→ these follow" reads as
								    an effect, not a standalone list. */}
								{groups.length > 0 && (
									<Box
										bg={ACCENT_SOFT}
										border="1px solid"
										borderColor={ACCENT_BORDER}
										borderRadius="lg"
										px={4}
										py={3}
									>
										<Flex align="center" gap={1.5} mb={2}>
											<Box color={ACCENT} display="flex">
												<LuPalette size={13} />
											</Box>
											<Text
												fontSize="2xs"
												fontWeight="bold"
												textTransform="uppercase"
												letterSpacing="0.07em"
												color={ACCENT}
											>
												{groups.length === 1
													? "The color you changed"
													: `${groups.length} colors you changed`}
											</Text>
										</Flex>
										<Stack gap={2}>
											{groups.map((g) => (
												<Flex
													key={g.parentKey}
													align="center"
													gap={2.5}
												>
													<Box
														boxSize="26px"
														borderRadius="7px"
														border="2px solid white"
														boxShadow="0 0 0 1px rgba(15, 23, 42, 0.14)"
														style={{
															background:
																g.parentNewColor || "#e5e7eb",
														}}
														flexShrink={0}
													/>
													<Text
														fontSize="sm"
														fontWeight="semibold"
														color="gray.900"
														truncate
													>
														{g.parentLabel}
													</Text>
												</Flex>
											))}
										</Stack>
									</Box>
								)}

								{/* Live net-effect summary. */}
								<Flex align="center" gap={2} px={0.5}>
									<Box
										boxSize="6px"
										borderRadius="full"
										bg={changedCount === 0 ? "gray.300" : ACCENT}
										flexShrink={0}
									/>
									<Text
										fontSize="xs"
										fontWeight="semibold"
										color={changedCount === 0 ? "gray.500" : "gray.700"}
									>
										{summary}
									</Text>
								</Flex>

								{/* Per-color decisions. */}
								<Stack gap={2.5}>
									{rows.map((c) => {
										const checked = !!decisions[c.field.key];
										// After-swatch shows the LITERAL outcome: the
										// new color if linked, or the old color
										// (unchanged) if detached.
										const afterColor = checked
											? c.newColor
											: c.oldColor;
										return (
											<Flex
												key={c.field.key}
												align="center"
												gap={4}
												pl={3.5}
												pr={4}
												py={3.5}
												cursor="pointer"
												onClick={() => toggle(c.field.key)}
												bg={checked ? ACCENT_SOFT : "gray.50"}
												borderWidth="1px"
												borderLeftWidth="3px"
												borderStyle="solid"
												borderColor={
													checked ? ACCENT_BORDER : "gray.200"
												}
												borderLeftColor={
													checked ? ACCENT : "gray.300"
												}
												borderRadius="lg"
												transition="background 0.15s, border-color 0.15s"
												_hover={{
													bg: checked
														? ACCENT_SOFT_STRONG
														: "gray.100",
													borderColor: checked
														? ACCENT
														: "gray.300",
												}}
											>
												{/* Before / arrow / After cluster */}
												<Flex
													align="center"
													gap={2.5}
													flexShrink={0}
												>
													<ColorTile
														color={c.oldColor}
														caption="Before"
														captionColor="gray.500"
													/>
													<Box
														color={
															checked ? ACCENT : "gray.300"
														}
														pb={4}
														transition="color 0.15s"
													>
														<LuArrowRight size={18} />
													</Box>
													<ColorTile
														color={afterColor}
														caption={checked ? "After" : "Kept"}
														captionColor={
															checked ? ACCENT : "gray.400"
														}
														dim={!checked}
													/>
												</Flex>

												{/* Field name + concise status */}
												<Stack gap={1} flex={1} minW={0}>
													<Text
														fontSize="sm"
														fontWeight="semibold"
														color="gray.900"
														truncate
													>
														{c.field.label}
													</Text>
													<Flex align="center" gap={1}>
														<Box
															color={
																checked
																	? ACCENT
																	: "gray.400"
															}
															display="flex"
															flexShrink={0}
														>
															{checked ? (
																<LuLink2 size={12} />
															) : (
																<LuLink2Off size={12} />
															)}
														</Box>
														<Text
															fontSize="xs"
															fontWeight="semibold"
															color={
																checked
																	? ACCENT
																	: "gray.500"
															}
														>
															{checked
																? "Will change"
																: "Stays unchanged"}
														</Text>
													</Flex>
												</Stack>

												<Checkbox
													checked={checked}
													onClick={(e) => e.stopPropagation()}
													onCheckedChange={(d) => {
														setDecisions((prev) => ({
															...prev,
															[c.field.key]: !!d.checked,
														}));
													}}
												/>
											</Flex>
										);
									})}
								</Stack>
							</Stack>
						</Dialog.Body>

						<Dialog.Footer
							px={{ base: 5, md: 6 }}
							py={4}
							borderTop="1px solid"
							borderColor="gray.100"
							bg="white"
							gap={2}
						>
							<Button variant="ghost" onClick={onCancel}>
								Cancel
							</Button>
							<Button
								bg={ACCENT}
								color="white"
								_hover={{ bg: ACCENT_HOVER }}
								onClick={handleApply}
							>
								{changedCount === 0
									? "Keep all unchanged"
									: `Update ${changedCount} color${changedCount === 1 ? "" : "s"}`}
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default LinkPropagationDialog;
