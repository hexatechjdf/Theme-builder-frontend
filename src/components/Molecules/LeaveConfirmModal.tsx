import { Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

interface Props {
	open: boolean;
	/** User chose to leave — discard unsaved changes and navigate. */
	onConfirm: () => void;
	/** User chose to stay — cancel the navigation. */
	onCancel: () => void;
}

// Shown by NavigationGuard when the user tries to navigate away from a page
// that still holds unsaved theme edits. Escape / backdrop click = stay (the
// safe default).
const LeaveConfirmModal: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
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
						w={{ base: "92vw", md: "440px" }}
						borderRadius="xl"
						boxShadow="2xl"
						overflow="hidden"
					>
						<Dialog.Body px={{ base: 5, md: 6 }} pt={7} pb={3}>
							<Stack gap={3.5} align="center" textAlign="center">
								<Flex
									align="center"
									justify="center"
									boxSize="54px"
									borderRadius="full"
									bg="#FEF3C7"
									color="#B45309"
									flexShrink={0}
								>
									<LuTriangleAlert size={26} />
								</Flex>
								<Dialog.Title
									fontSize="lg"
									fontWeight="bold"
									color="gray.900"
								>
									Leave with unsaved changes?
								</Dialog.Title>
								<Text
									fontSize="sm"
									color="gray.500"
									lineHeight="1.65"
									maxW="340px"
								>
									You've made theme changes that haven't been saved yet.
									If you leave this page now, those changes will be lost.
								</Text>
							</Stack>
						</Dialog.Body>
						<Dialog.Footer
							px={{ base: 5, md: 6 }}
							py={5}
							gap={2.5}
							flexDirection={{ base: "column-reverse", sm: "row" }}
						>
							<Button
								variant="outline"
								onClick={onCancel}
								w={{ base: "100%", sm: "auto" }}
								flex={{ base: "none", sm: 1 }}
							>
								Stay on page
							</Button>
							<Button
								bg="#DC2626"
								color="white"
								_hover={{ bg: "#B91C1C" }}
								_active={{ bg: "#991B1B" }}
								onClick={onConfirm}
								w={{ base: "100%", sm: "auto" }}
								flex={{ base: "none", sm: 1 }}
							>
								Leave & discard
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default LeaveConfirmModal;
