import { Button } from "../ui/button";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu";
import { LuChevronDown } from "react-icons/lu";
import { usePublishThemeToLive } from "../services/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { levelModeAtom } from "../Atoms/levelMode";
import { toast } from "react-toastify";
import { Spinner } from "@chakra-ui/react";
import { useState } from "react";

const PublishMenu = () => {


	type ActionType = "publish" | "revert" | null

	const setPublishStatus = useSetRecoilState(publishStatusAtom)
	const level = useRecoilValue(levelModeAtom);
	const [action, setAction] = useState<ActionType>(null)

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


		publishThemeMutation.mutate(payload as any, {
			onSuccess: () => {
				toast.success(
					newAction === "publish" ? "🎉 Theme published successfully!"
						: "↩️ Changes reverted successfully!"
				);
				setPublishStatus(newAction === "publish" ? "live" : "draft");
				setAction(null);
			},

			onError: (err: any) => {
				const message = err?.response?.data?.message || err?.message || "Something went wrong";
				toast.warn(`${message}`);
			}
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
