import { useMutation } from "react-query";
import { forgotPassword, ForgotPasswordRequest, ForgotPasswordResponse } from "../services/otpApi";

const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>(
    (payload) => forgotPassword(payload),
    {
      onSuccess: (data) => {
        console.log("Password reset success:", data.message);
        // You can add toast notifications or navigation here too
      },
      onError: (error) => {
        console.error("Password reset error:", error.message);
        // Show error toast or alert if you want
      }
    }
  );
};

export default useForgotPassword;
