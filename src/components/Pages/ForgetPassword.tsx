import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSendOtp from '../hooks/useSendOtp';
import { useNavigate } from 'react-router-dom';
import * as yup from "yup";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
const ForgetPassword = () => {
  interface FormValues {
    email: string;
  }
  
  const navigate = useNavigate()
  const sendOtpMutation = useSendOtp();

  const isLoading = sendOtpMutation.isLoading
  // console.log("isLoading", isLoading)

  // schema
  const schema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
  });

  const { register, handleSubmit, setError, formState: { errors }, } = useForm({
    resolver: yupResolver(schema)
  });


  const onSubmit = (formData: FormValues) => {
    sendOtpMutation.mutate(
      { email: formData.email },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'OTP sent successfully!');

          localStorage.setItem("forgotPasswordEmail", formData.email);
          setTimeout(() => {
            navigate("/verify-otp");
          }, 1000);
        },
        onError: (error: any) => {
          setError("email", {
            type: "manual",
            message: error?.response?.data?.message || error.message || "Failed to send OTP",
          });
          toast.error(error.message || 'Failed to send OTP');
          // console.log("data message ", error.message)
        },
      }
    );
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
          Enter Your Email to get OTP
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>

          <Stack gap="4">
            <div>
              <Text>Enter your Email</Text>
              <Input
                type="email"
                placeholder="Email"
                {...register('email')}
                borderColor={errors.email ? "red" : "black"}
              />
            </div>
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
            <Button
              type="submit"
              variant="solid"
              mt="2"
            >
              {isLoading ? " Sending OTP..." : "Send OTP"}

            </Button>

          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default ForgetPassword;
