import { Input, Link as ChakraLink, Stack } from "@chakra-ui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSendOtp from "../hooks/useSendOtp";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import AuthLayout from "../Layouts/AuthLayout";

const ForgetPassword = () => {
	interface FormValues {
		email: string;
	}

	const navigate = useNavigate();
	const sendOtpMutation = useSendOtp();

	const isLoading = sendOtpMutation.isLoading;

	// schema
	const schema = yup.object({
		email: yup.string().email("Invalid email").required("Email is required"),
	});

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onSubmit = (formData: FormValues) => {
		sendOtpMutation.mutate(
			{ email: formData.email },
			{
				onSuccess: (data) => {
					toast.success(data.message || "OTP sent successfully!");

					localStorage.setItem("forgotPasswordEmail", formData.email);
					setTimeout(() => {
						navigate("/verify-otp");
					}, 1000);
				},
				onError: (error: any) => {
					setError("email", {
						type: "manual",
						message:
							error?.response?.data?.message ||
							error.message ||
							"Failed to send OTP",
					});
					toast.error(error.message || "Failed to send OTP");
				},
			}
		);
	};

	return (
		<AuthLayout
			title="Forgot your password?"
			subtitle="Enter the email linked to your account and we'll send a one-time verification code to reset it."
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
						label="Email address"
						invalid={!!errors.email}
						errorText={errors.email?.message}
						helperText="We'll send a 6-digit code to this address."
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

					<Button
						type="submit"
						size="lg"
						w="full"
						colorPalette="brand"
						borderRadius="lg"
						fontWeight="semibold"
						loading={isLoading}
						loadingText="Sending code…"
					>
						Send verification code
					</Button>
				</Stack>
			</form>
		</AuthLayout>
	);
};

export default ForgetPassword;
