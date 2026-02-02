// src/mycomponents/user/Services/Urls/authService.ts
import { publicAxiosInstance } from "./Urls";

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

export const registerService = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await publicAxiosInstance.post<RegisterResponse>(
    "/auth/signUp",
    payload
  );
  return response.data;
};

export const verifyResetCodeService = async (
  data: VerifyCodeRequest
): Promise<VerifyCodeResponse> => {
  const response = await publicAxiosInstance.post<VerifyCodeResponse>(
    "/forgetPassword/verifyResetCode",
    data
  );
  return response.data;
};

export const resetPasswordService = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await publicAxiosInstance.put<ResetPasswordResponse>(
    "/forgetPassword/resetPassword",
    data
  );
  return response.data;
};

// Login
export const loginService = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await publicAxiosInstance.post<LoginResponse>("/auth/login", data);
  return response.data;
};

// Forget password
export const forgetPasswordService = async (
  data: ForgetPasswordRequest
): Promise<ForgetPasswordResponse> => {
  const response = await publicAxiosInstance.post<ForgetPasswordResponse>(
    "/auth/forgetPassword",
    data
  );
  return response.data;
};
