// src/mycomponents/user/Services/Urls/authService.ts
import { publicAxiosInstance } from "./Urls"; // instance عام بدون interceptors

// ====== Types ======
export interface ForgetPasswordRequest { email: string; }
export interface ForgetPasswordResponse { status: string; message?: string; }

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: Record<string, unknown>;
  message?: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  confirmPassword: string;
}
export interface ResetPasswordResponse { status: string; message?: string; token?: string; }

export interface VerifyCodeRequest { resetCode: string; }
export interface VerifyCodeResponse { status: string; message?: string; }

export interface RegisterRequest {
  fullname: string;
  email: string;
  phone: { countryCode: string; phoneNumber: string; };
  password: string;
  confirmPassword: string;
  organizations: string[];
  role: string;
}
export interface RegisterResponse {
  status: string;
  message?: string;
  data?: Record<string, unknown>;
}

// ====== Services ======

// Register - عامة => نستخدم publicAxiosInstance
export const registerService = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await publicAxiosInstance.post<RegisterResponse>(
    "/users/register",
    payload
  );
  return response.data;
};

// Verify reset code - عامة
export const verifyResetCodeService = async (
  data: VerifyCodeRequest
): Promise<VerifyCodeResponse> => {
  const response = await publicAxiosInstance.post<VerifyCodeResponse>(
    "/auth/verifiedPassword",
    data
  );
  return response.data;
};

// Reset password - عامة (عادة بدون Authorization) — إذا كانت تتطلب توكن استخدم axiosClient
export const resetPasswordService = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await publicAxiosInstance.patch<ResetPasswordResponse>(
    "/auth/resetPassword",
    data
  );
  return response.data;
};

// Login - عامة
export const loginService = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await publicAxiosInstance.post<LoginResponse>("/auth/login", data);
  return response.data;
};

// Forget password - عامة
export const forgetPasswordService = async (
  data: ForgetPasswordRequest
): Promise<ForgetPasswordResponse> => {
  const response = await publicAxiosInstance.post<ForgetPasswordResponse>(
    "/auth/forgetPassword",
    data
  );
  return response.data;
};
