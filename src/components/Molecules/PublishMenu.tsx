import { Button } from "../ui/button";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu";
import { LuChevronDown } from "react-icons/lu";
import { usePublishThemeToLive } from "../services/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { saveActivityAtom } from "../Atoms/saveActivityAtom";
import { levelModeAtom } from "../Atoms/levelMode";
import { toast } from "react-toastify";
import { Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { clearFieldCache } from "../utilities/clearFieldCache";
import { notifyChangedListChanged } from "../store/changedListStore";
import { revertNonceAtom } from "../Atoms/revertNonceAtom";

const PublishMenu = () => {


	type ActionType = "publish" | "revert" | null

	const setPublishStatus = useSetRecoilState(publishStatusAtom)
	const setSaveActivity = useSetRecoilState(saveActivityAtom)
	const setRevertNonce = useSetRecoilState(revertNonceAtom)
	const level = useRecoilValue(levelModeAtom);
	const [action, setAction] = useState<ActionType>(null)

	const queryClient = useQueryClient();
	const publishThemeMutation = usePublishThemeToLive();
	const { isLoading } = publishThemeMutation;

	const handlePublish = (from: string, to: string, newAction: ActionType) => {
		const locationId =
			level.mode === "subaccount"
				? level.subaccountId ?? "agency"
				: "agency";
		const payload = {
			from,
			to,
			locationId,
		}
		setAction(newAction)
		setSaveActivity(newAction === "publish" ? "publishing" : "reverting")


		publishThemeMutation.mutate(payload as any, {
			onSuccess: async () => {
				// Revert rewrites the draft server-side, so the UI must re-read
				// it. Refetch the reverted draft, reset local field state, then
				// bump `revertNonce` — MainLayout uses it as a key to remount
				// the theme content, forcing every field to re-read the
				// reverted values. No page reload needed. (Publish leaves the
				// draft unchanged, so it needs none of this.)
				if (newAction === "revert") {
					try {
						await queryClient.invalidateQueries([
							"updatedUserThemeSetting",
						]);
					} catch {
						/* a refetch hiccup shouldn't block the reset + remount */
					}
					clearFieldCache();
					notifyChangedListChanged();
					setRevertNonce((n) => n + 1);
				}
				toast.success(
					newAction === "publish"
						? "Theme published successfully"
						: "Changes reverted successfully"
				);
				setPublishStatus(newAction === "publish" ? "live" : "draft");
				setAction(null);
			},

			onError: (err: any) => {
				const message = err?.response?.data?.message || err?.message || "Something went wrong";
				toast.warn(`${message}`);
			},

			onSettled: () => {
				setSaveActivity("idle");
			},
		})
	};

	const renderButtonContent = () => {
		if (!isLoading) {
			return (
				<>
					Publish <LuChevronDown size={14} />
				</>
			)
		};

		if (action === "publish") {
			return (
				<>
					<Spinner size="sm" mr="2" /> Publishing…
				</>
			)
		}
		if (action === "revert") {
			return (
				<>
					<Spinner size="sm" mr="2" /> Reverting…
				</>
			)
		}
		return (
			<>
				<Spinner size="sm" mr="2" /> Working…
			</>
		);
	}

	return (
		<>
			<MenuRoot>
				<MenuTrigger asChild>
					<Button
						bg="white"
						color="#735DFF"
						_hover={{ bg: "whiteAlpha.900" }}
						_active={{ bg: "white" }}
						borderRadius="full"
						h="32px"
						minH="32px"
						px={4}
						py={0}
						fontWeight="semibold"
						fontSize="sm"
						border="1px solid"
						borderColor="white"
						boxShadow="sm"
						transition="all 0.2s"
						flexShrink={0}
						gap={1.5}
					>
						{renderButtonContent()}
					</Button>
				</MenuTrigger>
				<MenuContent borderRadius="md" boxShadow="lg">
					<MenuItem
						value="live"
						cursor="pointer"
						onClick={() => handlePublish("draft", "live", "publish")}
						color="#735DFF"
						fontWeight="medium"
					>
						Publish Now
					</MenuItem>
					<MenuItem
						value="revert"
						cursor="pointer"
						onClick={() => handlePublish("live", "draft", "revert")}
						color="gray.600"
					>
						Revert Changes
					</MenuItem>
				</MenuContent>
			</MenuRoot>
		</>
	);
};

export default PublishMenu;
