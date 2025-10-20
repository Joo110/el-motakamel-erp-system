// src/mycomponents/user/hooks/useRegister.ts
import { useState } from "react";
import axios from "axios";
import { registerService } from "../Services/Urls/authService";
import type { RegisterRequest, RegisterResponse } from "../Services/Urls/authService";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegisterResponse | null>(null);

  const register = async (payload: RegisterRequest) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await registerService(payload);
      setData(res);
      return res;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Registration failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, data };
};