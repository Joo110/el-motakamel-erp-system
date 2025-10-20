// src/lib/axiosClient.ts
import axios, { type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

// أساسي
const axiosClient = axios.create({
  baseURL: "https://erp-3-5mq8.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: يضيف Authorization لو فيه توكن مخزن
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

// Response interceptor: يحاول عمل refresh لو 401 ويعيد إرسال الطلب
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // تحقق آمن إن الخطأ من axios وفيه config
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as RetryableRequest | undefined;
    if (!originalRequest) return Promise.reject(error);

    // لو السيرفر رجّع 401 وده أول retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        // استخدم axios (global) عشان لا يدخل الطلب في interceptors الحالية
        const res = await axios.post(
          "https://erp-3-5mq8.onrender.com/api/v1/auth/refresh",
          { token: refreshToken }
        );

        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          Cookies.set("authToken", newAccessToken, { expires: 7 });
          if (!originalRequest.headers) originalRequest.headers = {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // أعد إرسال الطلب الأصلي باستخدام axiosClient
          return axiosClient(originalRequest);
        }

        // لو مفيش توكن جديد اعتبر الفشل
        throw new Error("Refresh succeeded but no access token returned");
      } catch (refreshError) {
        // سجل الخطأ ونظف التوكنات
        console.error("Refresh token error:", refreshError);
        Cookies.remove("authToken");
        Cookies.remove("refreshToken");

        // اختيارياً: لا تعمل redirect هنا لو بتحب تترك الـ UI يتعامل مع إعادة التوجيه
        // window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;