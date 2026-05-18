import axios, { AxiosResponse } from "axios";
import { SSO_TOKEN, APP_KEY } from "../utilities/appHeaders";
import { API_BASE_URL } from "../utilities/apiConfig";

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
  otp: string;
}
// request and response interfaces for forgot password

export interface ForgotPasswordRequest {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success?: boolean;
}

const otpAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

otpAxios.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["SSO-Token"] = SSO_TOKEN;
  config.headers["APP-KEY"] = APP_KEY;
  return config;
});

export const sendOtp = async (payload: SendOtpRequest): Promise<SendOtpResponse> => {
  try {
    const response: AxiosResponse<SendOtpResponse> = await otpAxios.post("/send-otp", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An error occurred while sending OTP"
    );
  }
};


export const forgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  try {
    const response: AxiosResponse<ForgotPasswordResponse> = await otpAxios.post(
      "/forgot-password",
      payload
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An error occurred while resetting password"
    );
  }
};
