import { useState } from "react";
import Cookies from "js-cookie";
import { loginService } from "../Services/Urls/authService";
import type { LoginResponse } from "../Services/Urls/authService";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginService({ email, password });
      const token = response.token || response.accessToken;

      if (token) {
        Cookies.set("authToken", token, { expires: 7 });
        if (response.user) {
          Cookies.set("userData", JSON.stringify(response.user), { expires: 7 });
        }
      }

      setData(response);
      return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, data };
};