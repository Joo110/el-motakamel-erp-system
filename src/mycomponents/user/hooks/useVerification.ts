import { useState } from "react";
import type { VerifyCodeResponse } from "../Services/Urls/authService";
import { verifyResetCodeService } from "../Services/Urls/authService";

export const useVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyCodeResponse | null>(null);

  const verifyCode = async (resetCode: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await verifyResetCodeService({ resetCode });
      setData(response);
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verifyCode, loading, error, data };
};