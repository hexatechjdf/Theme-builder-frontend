import {
    Box,
    Button,
    Heading,
    Image,
    Input,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSetRecoilState } from "recoil";
import { authState } from "../Atoms/authAtom";
import visible from "../../assets/visible.png";
import hidden from "../../assets/hidden.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../services/auth";
import useToggle from "../hooks/useToggle";

const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6).required("Password is required"),
});

const Login = () => {
    // const [showPassword, setShowPassword] = useState(false);
    const setAuth = useSetRecoilState(authState);
    const navigate = useNavigate();
    const [showPassword, togglePassword] = useToggle();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const loginMutation = useMutation(loginApi, {
        onSuccess: (data) => {
            if (!data?.access_token || !data?.token_type) {
                toast.error("Invalid response from server");
                return;
            }

            const token = `${data.token_type} ${data.access_token}`;
            const user = data.user_detail;
            const companyId = data.company_id;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setAuth({
                isAuthenticated: true,
                token,
                user,
                companyId,
            });

            toast.success(data.message || "Login successful");
            navigate("/dashboard");
        },
        onError: (error: any) => {
            const msg =
                error?.response?.data?.message ||
                error.message ||
                "Something went wrong";
            toast.error(msg);
        },
    });

    const onSubmit = (formData: any) => {
        loginMutation.mutate(formData);
    };

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={{ base: 3, md: 4 }} bg="#735DFF">
            <Box
                w={{ base: "100%", sm: "80%", md: "400px" }}
                maxW="100%"
                p={{ base: 5, md: 6 }}
                boxShadow="lg"
                borderRadius="md"
                bg="white"
            >
                <Text fontSize={{ base: "md", md: "xl" }} textAlign="center" color="black" fontWeight="bold">
                    CRM Theme Customizer
                </Text>
                <Heading textAlign="center" size={{ base: "lg", md: "2xl" }} mb={{ base: 6, md: 10 }} fontWeight="bold">
                    Login to your Account
                </Heading>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap="4">
                        {/* Email */}
                        <Box>
                            <Text>Email</Text>
                            <Input
                                type="email"
                                placeholder="Email"
                                {...register("email")}
                                borderColor={errors.email ? "red.500" : "black"}
                                focusRingColor={errors.email ? "red.500" : "purple.500"}
                                transition="border-color 0.2s ease"
                            />
                            <Box
                                color="red.500"
                                fontSize="sm"
                                height={errors.email ? "auto" : "0"}
                                opacity={errors.email ? 1 : 0}
                                overflow="hidden"
                                transition="all 0.3s ease"
                            >
                                {errors.email?.message}
                            </Box>
                        </Box>

                        {/* Password */}
                        <Box position="relative">
                            <Text>Password</Text>
                            <Input
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                borderColor={errors.password ? "red.500" : "black"}
                                focusRingColor={errors.email ? "red.500" : "purple.500"}
                                transition="border-color 0.2s ease"
                            />
                            <Button
                                bg="transparent"
                                color="black"
                                position="absolute"
                                right="0"
                                top="6"
                                onClick={togglePassword}
                                disabled={!watch("password")}
                                _hover={{ bg: "transparent" }}
                            >
                                <Image height={5} src={showPassword ? visible : hidden} alt="toggle" />
                            </Button>

                            <Box
                                color="red.500"
                                fontSize="sm"
                                height={errors.password ? "auto" : "0"}
                                opacity={errors.password ? 1 : 0}
                                overflow="hidden"
                                transition="all 0.3s ease"
                            >
                                {errors.password?.message}
                            </Box>

                            <Box
                                textAlign="right"
                                fontSize="12px"
                                marginTop="10px"
                                textDecoration="underline"
                                transition="opacity 0.3s ease"
                            >
                                <Link to="/forget-password">Forget password?</Link>
                            </Box>
                        </Box>

                        <Button
                            type="submit"
                            variant="solid"
                            mt="2"
                            disabled={loginMutation.isLoading}
                        >
                            {loginMutation.isLoading ? <Spinner size="sm" /> : "Submit"}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
};

export default Login;
