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
import { LuArrowRight } from "react-icons/lu";
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

const SWATCH_SIZE = "44px";

const ColorTile: React.FC<{
	color: string;
	caption: string;
	captionColor: string;
}> = ({ color, caption, captionColor }) => (
	<Stack gap={1.5} align="center" flexShrink={0}>
		<Box
			boxSize={SWATCH_SIZE}
			borderRadius="md"
			border="2px solid white"
			boxShadow="0 0 0 1px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(0, 0, 0, 0.06)"
			style={{ background: color || "#e5e7eb" }}
			transition="background 0.2s ease"
		/>
		<Text
			fontSize="2xs"
			fontWeight="semibold"
			textTransform="uppercase"
			letterSpacing="wider"
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
							<Flex justify="space-between" align="center" gap={3}>
								<Box minW={0}>
									<Dialog.Title
										fontSize={{ base: "md", md: "lg" }}
										fontWeight="bold"
										color="gray.900"
									>
										Linked colors
									</Dialog.Title>
									<Text fontSize="xs" color="gray.500" mt={0.5}>
										These colors will update to match the one you just
										changed. Uncheck any you'd like to keep as it is.
									</Text>
								</Box>
								<Dialog.CloseTrigger>
									<CloseButton size="sm" />
								</Dialog.CloseTrigger>
							</Flex>
						</Dialog.Header>

						<Dialog.Body px={{ base: 4, md: 5 }} py={4} maxH="65vh" overflowY="auto">
							<Stack gap={2.5}>
								{rows.map((c) => {
									const checked = !!decisions[c.field.key];
									// After-swatch shows the LITERAL outcome: the new color
									// if linked, or the old color (unchanged) if detached.
									const afterColor = checked ? c.newColor : c.oldColor;
									const accent = checked ? "#735DFF" : "gray.400";
									return (
										<Flex
											key={c.field.key}
											align="center"
											gap={4}
											px={4}
											py={3.5}
											cursor="pointer"
											onClick={() => toggle(c.field.key)}
											bg={
												checked
													? "rgba(115, 93, 255, 0.05)"
													: "gray.50"
											}
											border="1px solid"
											borderColor={
												checked
													? "rgba(115, 93, 255, 0.25)"
													: "gray.200"
											}
											borderRadius="lg"
											transition="background 0.15s, border-color 0.15s"
											_hover={{
												borderColor: checked
													? "rgba(115, 93, 255, 0.45)"
													: "gray.300",
											}}
										>
											{/* Before / arrow / After cluster */}
											<Flex align="center" gap={3} flexShrink={0}>
												<ColorTile
													color={c.oldColor}
													caption="Before"
													captionColor="gray.500"
												/>
												<Box color={accent} pb={4}>
													<LuArrowRight size={18} />
												</Box>
												<ColorTile
													color={afterColor}
													caption="After"
													captionColor={accent}
												/>
											</Flex>

											{/* Field name + concise status */}
											<Stack gap={0.5} flex={1} minW={0}>
												<Text
													fontSize="sm"
													fontWeight="semibold"
													color="gray.900"
													truncate
												>
													{c.field.label}
												</Text>
												<Text
													fontSize="xs"
													fontWeight="medium"
													color={checked ? "#735DFF" : "gray.500"}
												>
													{checked
														? "Will change"
														: "Stays unchanged"}
												</Text>
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
								bg="#735DFF"
								color="white"
								_hover={{ bg: "#5b48d9" }}
								onClick={handleApply}
							>
								Apply
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default LinkPropagationDialog;
