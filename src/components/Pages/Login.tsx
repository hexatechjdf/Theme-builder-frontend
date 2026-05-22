import {
	Box,
	Flex,
	IconButton,
	Input,
	Link as ChakraLink,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "react-query";
import { useSetRecoilState } from "recoil";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { authState } from "../Atoms/authAtom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { loginApi } from "../services/auth";
import useToggle from "../hooks/useToggle";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import AuthLayout from "../Layouts/AuthLayout";

const schema = yup.object().shape({
	email: yup.string().email("Invalid email").required("Email is required"),
	password: yup.string().min(6).required("Password is required"),
});

const Login = () => {
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
		<AuthLayout
			title="Welcome back"
			subtitle="Sign in to manage and publish your CRM themes."
			footer={
				<Text>
					Trouble signing in? Contact your account administrator.
				</Text>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack gap={5} colorPalette="brand">
					<Field
						label="Email address"
						invalid={!!errors.email}
						errorText={errors.email?.message}
					>
						<Input
							type="email"
							size="lg"
							placeholder="you@company.com"
							borderRadius="lg"
							borderColor="gray.300"
							{...register("email")}
						/>
					</Field>

					<Field
						label="Password"
						invalid={!!errors.password}
						errorText={errors.password?.message}
					>
						<Box position="relative" w="full">
							<Input
								type={showPassword ? "text" : "password"}
								size="lg"
								placeholder="Enter your password"
								borderRadius="lg"
								borderColor="gray.300"
								pr={12}
								{...register("password")}
							/>
							<IconButton
								aria-label={
									showPassword ? "Hide password" : "Show password"
								}
								variant="ghost"
								size="sm"
								color="gray.500"
								position="absolute"
								right="2"
								top="50%"
								transform="translateY(-50%)"
								onClick={togglePassword}
								disabled={!watch("password")}
								_hover={{ bg: "gray.100", color: "gray.700" }}
							>
								{showPassword ? (
									<LuEyeOff size={18} />
								) : (
									<LuEye size={18} />
								)}
							</IconButton>
						</Box>
					</Field>

					<Flex justify="flex-end" mt={-1}>
						<ChakraLink
							asChild
							fontSize="sm"
							fontWeight="medium"
							color="brand.600"
							_hover={{ color: "brand.700" }}
						>
							<RouterLink to="/forget-password">
								Forgot password?
							</RouterLink>
						</ChakraLink>
					</Flex>

					<Button
						type="submit"
						size="lg"
						w="full"
						colorPalette="brand"
						borderRadius="lg"
						fontWeight="semibold"
						loading={loginMutation.isLoading}
						loadingText="Signing in…"
					>
						Sign in
					</Button>
				</Stack>
			</form>
		</AuthLayout>
	);
};

export default Login;
