import { useState } from "react";
import type {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../Services/Urls/authService";
import { resetPasswordService } from "../Services/Urls/authService";

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResetPasswordResponse | null>(null);

  const resetPassword = async (payload: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await resetPasswordService(payload);
      setData(response);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, data };
};