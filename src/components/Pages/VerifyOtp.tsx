import { Box, IconButton, Input, Link as ChakraLink, Stack } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useForgotPassword from "../hooks/useForgotPassword";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import AuthLayout from "../Layouts/AuthLayout";

const schema = yup.object().shape({
	otp: yup.string().required("OTP is required"),
	password: yup
		.string()
		.min(8, "Password must be at least 8 characters")
		.required("Password is required"),
	passwordConfirmation: yup
		.string()
		.oneOf([yup.ref("password")], "Passwords do not match")
		.required("Please confirm your password"),
});

const VerifyOtp = () => {
	const forgotPasswordMutation = useForgotPassword();
	const isLoading = forgotPasswordMutation.isLoading;

	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const email = localStorage.getItem("forgotPasswordEmail") || "";

	const onSubmit = (data: any) => {
		if (!email) {
			toast.error("Email is missing");
			return;
		}

		forgotPasswordMutation.mutate(
			{
				email,
				otp: data.otp,
				password: data.password,
				password_confirmation: data.passwordConfirmation,
			},
			{
				onSuccess: (data: any) => {
					toast.success(data.message || "OTP verified successfully!");
					setTimeout(() => {
						navigate("/login");
					}, 1000);
				},
				onError: (error: any) => {
					// Show toast message
					if (error?.message) {
						setError("otp", {
							type: "manual",
							message:
								error?.response?.data?.message ||
								error.message ||
								"Failed to send OTP",
						});

						toast.error(error.message);
					}

					if (error?.errors) {
						Object.entries(error.errors).forEach(
							([field, messages]: [string, any]) => {
								if (Array.isArray(messages)) {
									setError(field as any, { message: messages[0] });
								}
							}
						);
					}
				},
			}
		);
	};

	const [showPassword, setShowPassword] = useState(true);
	const [showConfirmPassword, setShowConfirmPassword] = useState(true);
	// show password
	const showNewPassword = (e: any) => {
		e.preventDefault();
		setShowPassword((showPassword) => !showPassword);
	};

	const toggleConfirmPassword = (e: any) => {
		e.preventDefault();
		setShowConfirmPassword((showConfirmPassword) => !showConfirmPassword);
	};

	return (
		<AuthLayout
			title="Reset your password"
			subtitle={
				email
					? `Enter the code we sent to ${email} and choose a new password.`
					: "Enter the verification code from your email and choose a new password."
			}
			footer={
				<ChakraLink
					asChild
					color="white"
					fontWeight="medium"
					_hover={{ textDecoration: "underline" }}
				>
					<RouterLink to="/login">← Back to sign in</RouterLink>
				</ChakraLink>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack gap={5} colorPalette="brand">
					<Field
						label="Verification code"
						invalid={!!errors.otp}
						errorText={errors.otp?.message}
						helperText="Enter the 6-digit code sent to your email."
					>
						<Input
							type="text"
							inputMode="numeric"
							size="lg"
							placeholder="••••••"
							borderRadius="lg"
							borderColor="gray.300"
							letterSpacing="0.4em"
							fontWeight="semibold"
							{...register("otp")}
						/>
					</Field>

					<Field
						label="New password"
						invalid={!!errors.password}
						errorText={errors.password?.message}
						helperText="Use at least 8 characters."
					>
						<Box position="relative" w="full">
							<Input
								type={showPassword ? "password" : "text"}
								size="lg"
								placeholder="Enter a new password"
								borderRadius="lg"
								borderColor="gray.300"
								pr={12}
								{...register("password")}
							/>
							<IconButton
								aria-label={
									showPassword ? "Show password" : "Hide password"
								}
								variant="ghost"
								size="sm"
								color="gray.500"
								position="absolute"
								right="2"
								top="50%"
								transform="translateY(-50%)"
								onClick={showNewPassword}
								_hover={{ bg: "gray.100", color: "gray.700" }}
							>
								{showPassword ? (
									<LuEye size={18} />
								) : (
									<LuEyeOff size={18} />
								)}
							</IconButton>
						</Box>
					</Field>

					<Field
						label="Confirm new password"
						invalid={!!errors.passwordConfirmation}
						errorText={errors.passwordConfirmation?.message}
					>
						<Box position="relative" w="full">
							<Input
								type={showConfirmPassword ? "password" : "text"}
								size="lg"
								placeholder="Re-enter your new password"
								borderRadius="lg"
								borderColor="gray.300"
								pr={12}
								{...register("passwordConfirmation")}
							/>
							<IconButton
								aria-label={
									showConfirmPassword
										? "Show password"
										: "Hide password"
								}
								variant="ghost"
								size="sm"
								color="gray.500"
								position="absolute"
								right="2"
								top="50%"
								transform="translateY(-50%)"
								onClick={toggleConfirmPassword}
								_hover={{ bg: "gray.100", color: "gray.700" }}
							>
								{showConfirmPassword ? (
									<LuEye size={18} />
								) : (
									<LuEyeOff size={18} />
								)}
							</IconButton>
						</Box>
					</Field>

					<Button
						type="submit"
						size="lg"
						w="full"
						colorPalette="brand"
						borderRadius="lg"
						fontWeight="semibold"
						loading={isLoading}
						loadingText="Resetting password…"
					>
						Reset password
					</Button>
				</Stack>
			</form>
		</AuthLayout>
	);
};

export default VerifyOtp;
