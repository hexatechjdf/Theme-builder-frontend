// src/hooks/useSendOtp.ts

import { useMutation } from "react-query";
import { sendOtp, SendOtpRequest, SendOtpResponse } from "../services/otpApi";

const useSendOtp = () => {
  return useMutation<SendOtpResponse, Error, SendOtpRequest>(
    (payload) => sendOtp(payload),
    {
      onError: (error: Error) => {
        console.error("Send OTP error:", error.message);
      },
      onSuccess: (data) => {
        // console.log("OTP sent:", data);
      },
    }
  );
};

export default useSendOtp;
