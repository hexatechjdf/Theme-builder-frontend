import { Box, Button, Heading, IconButton, Image, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useForgotPassword from '../hooks/useForgotPassword';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import visible from "../../assets/visible.png";
import hidden from "../../assets/hidden.png";
const schema = yup.object().shape({
    otp: yup.string().required('OTP is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    passwordConfirmation: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords do not match')
        .required('Please confirm your password'),
});

const VerifyOtp = () => {
    const forgotPasswordMutation = useForgotPassword();
    const isLoading = forgotPasswordMutation.isLoading

    const navigate = useNavigate()
    const { register, handleSubmit, setError, formState: { errors }, } = useForm({
        resolver: yupResolver(schema),
    });

    const email = localStorage.getItem('forgotPasswordEmail') || '';

    const onSubmit = (data: any) => {
        if (!email) {
            toast.error("Email is missing");
            return;
        }

        forgotPasswordMutation.mutate({
            email,
            otp: data.otp,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
        },
            {
                onSuccess: (data: any) => {
                    toast.success(data.message || 'OTP verified successfully!');
                    setTimeout(() => {
                        navigate("/login");
                    }, 1000);
                },
                onError: (error: any) => {
                    // Show toast message
                    if (error?.message) {
                        setError("otp", {
                            type: "manual",
                            message: error?.response?.data?.message || error.message || "Failed to send OTP",
                        });



                        toast.error(error.message);
                    }


                    if (error?.errors) {
                        Object.entries(error.errors).forEach(([field, messages]: [string, any]) => {
                            if (Array.isArray(messages)) {
                                setError(field as any, { message: messages[0] });
                            }
                        });
                    }
                }
            }




        );
    };



    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    // show password
    const showNewPassword = (e: any) => {
        e.preventDefault()
        setShowPassword((showPassword) => !showPassword)
    }

    const toggleConfirmPassword = (e: any) => {
        e.preventDefault()
        setShowConfirmPassword((showConfirmPassword) => !showConfirmPassword)
    }

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
                    Reset Password
                </Heading>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap="4">
                        <div>
                            <Text>Enter the OTP sent to your email</Text>
                            <Input
                                type="text"
                                placeholder="Enter OTP"
                                {...register('otp')}
                            />
                            {errors.otp && <Text color="red.500" fontSize="sm">{errors.otp.message}</Text>}
                        </div>
                        <div>
                            <Text>New Password</Text>


                            <Box position="relative">
                                <Input
                                    type={showPassword ? "password" : "text"}
                                    placeholder="New Password"
                                    {...register('password')}
                                />
                                <Button
                                    bg="transparent"
                                    color="black"
                                    position="absolute"
                                    right="0"
                                    top="0"
                                    onClick={showNewPassword}
                                    _hover={{ bg: "transparent" }}
                                >
                                    <Image height={5} src={showPassword ? visible : hidden} alt="toggle" />
                                </Button>
                            </Box>



                            {errors.password && <Text color="red.500" fontSize="sm">{errors.password.message}</Text>}
                        </div>
                        <div>
                            <Text>Confirm New Password</Text>
                            <Box position="relative">
                                <Input
                                    type={showConfirmPassword ? "password" : "text"}
                                    placeholder="Confirm Password"
                                    {...register('passwordConfirmation')}
                                />

                                <Button
                                    bg="transparent"
                                    color="black"
                                    position="absolute"
                                    right="0"
                                    top="0"
                                    onClick={toggleConfirmPassword}
                                    _hover={{ bg: "transparent" }}
                                >
                                    <Image height={5} src={showConfirmPassword ? visible : hidden} alt="toggle" />
                                </Button>
                                {errors.passwordConfirmation && (
                                    <Text color="red.500" fontSize="sm">{errors.passwordConfirmation.message}</Text>
                                )}
                            </Box>
                        </div>
                        <Button
                            type="submit"
                            variant="solid"
                            mt="2"
                            colorScheme="purple"
                        >
                            {isLoading ? <Spinner /> : " Reset Password"}

                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
};

export default VerifyOtp;
