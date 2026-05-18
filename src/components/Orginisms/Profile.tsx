import {
    Avatar,
    Box,
    HStack,
    Menu,
    Portal,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { authState } from "../Atoms/authAtom";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../services/auth";
import { useMutation } from "react-query";
import userIcon from "../../assets/user.svg";

const Profile = () => {
    const auth = useRecoilValue(authState);
    const resetAuth = useResetRecoilState(authState);
    const navigate = useNavigate();

    const { mutate: handleLogout, isLoading } = useMutation(logoutApi, {
        onSuccess: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            resetAuth();
            navigate("/login");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error.message || "Logout failed";
            console.error(msg);
        },
    });

    if (!auth?.isAuthenticated || !auth?.user) {
        return null;
    }

    const userName = auth.user.name ?? "";
    const userEmail = (auth.user as { email?: string })?.email ?? "";

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <HStack
                    cursor="pointer"
                    bg="whiteAlpha.200"
                    _hover={{ bg: "whiteAlpha.300" }}
                    borderRadius="full"
                    h="32px"
                    pl="2px"
                    pr={{ base: "2px", md: 3 }}
                    gap={2}
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    transition="all 0.2s"
                    flexShrink={0}
                    aria-label="Open profile menu"
                >
                    {isLoading ? (
                        <Box w="26px" h="26px" display="flex" alignItems="center" justifyContent="center">
                            <Spinner size="xs" color="white" />
                        </Box>
                    ) : (
                        <Avatar.Root w="26px" h="26px" border="2px solid" borderColor="whiteAlpha.500">
                            <Avatar.Fallback>
                            {userName ? userName.trim().charAt(0).toUpperCase() : "?"}
                        </Avatar.Fallback>
                            <Avatar.Image src={userIcon} />
                        </Avatar.Root>
                    )}
                    <Text
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        display={{ base: "none", md: "inline" }}
                        truncate
                        maxW="120px"
                    >
                        {userName}
                    </Text>
                    <Box
                        display={{ base: "none", md: "inline-flex" }}
                        color="whiteAlpha.700"
                        alignItems="center"
                    >
                        <LuChevronDown size={14} />
                    </Box>
                </HStack>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner>
                    <Menu.Content minW="220px" borderRadius="md" boxShadow="lg">
                        {/* User info header */}
                        <Stack px={3} py={2.5} gap={0} borderBottom="1px solid" borderColor="gray.100">
                            <Text fontSize="sm" fontWeight="semibold" color="gray.800" truncate>
                                {userName}
                            </Text>
                            {userEmail && (
                                <Text fontSize="xs" color="gray.500" truncate>
                                    {userEmail}
                                </Text>
                            )}
                        </Stack>

                        <Menu.Item cursor="pointer" value="white-label-domain">
                            White label domain
                        </Menu.Item>
                        <Menu.Item cursor="pointer" value="profile">
                            Profile
                        </Menu.Item>
                        <Menu.Item
                            cursor="pointer"
                            value="logout"
                            onClick={() => handleLogout()}
                            disabled={isLoading}
                            color="red.600"
                            _hover={{ bg: "red.50" }}
                        >
                            Logout
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};

export default Profile;
