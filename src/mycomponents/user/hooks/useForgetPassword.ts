import { useState } from "react";
import { forgetPasswordService } from "../Services/Urls/authService";
import type { ForgetPasswordResponse } from "../Services/Urls/authService";

export const useForgetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ForgetPasswordResponse | null>(null);

  const forgetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await forgetPasswordService({ email });
      setData(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return { forgetPassword, loading, error, data };
};