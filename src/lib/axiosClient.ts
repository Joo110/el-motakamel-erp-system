import axios, { type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

const baseURL =
  import.meta.env.VITE_API_URL || "/api";

const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken") || localStorage.getItem("token");
    if (token && config && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as RetryableRequest | undefined;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await axios.post(
          `${baseURL.replace(/\/$/, "")}/auth/refresh`,
          { token: refreshToken }
        );

        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          Cookies.set("authToken", newAccessToken, { expires: 7 });
          if (!originalRequest.headers) originalRequest.headers = {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }

        throw new Error("Refresh succeeded but no access token returned");
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        Cookies.remove("authToken");
        Cookies.remove("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;