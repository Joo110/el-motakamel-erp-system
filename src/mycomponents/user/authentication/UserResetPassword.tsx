import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, EyeOff, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { useResetPassword } from "../hooks/useResetPassword";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const UserResetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const { resetPassword, loading } = useResetPassword();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, confirmPassword, trigger]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await resetPassword({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success(response?.message || "Password reset successfully ✅");
    } catch (error: any) {
      // عرض رسالة الخطأ من السيرفر إن وُجِدت، وإلا رسالة عامة
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password. Please try again ❌";
      toast.error(errMsg);
      // useful for debugging without affecting UI
      // eslint-disable-next-line no-console
      console.error("Reset password error:", error);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
      <img src="/images/Logo.png" alt="Logo" className="w-24 h-auto mb-2" />
      <h2 className="text-black text-[32px] font-bold">New password</h2>
      <p className="text-gray-500 font-light text-[20px]">
        Create a new password to secure your account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        {/* Email */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            placeholder="Enter your email"
            className="border-[2px] border-[#213555] rounded w-full"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  // at least one lowercase, one uppercase, one digit, one special char
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
                  message:
                    "Password must include uppercase, lowercase, number & special character",
                },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              className="pl-9  border-[2px] border-[#213555] rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="pl-9 border-[2px] border-[#213555] rounded"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          disabled={isSubmitting || loading}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting || loading ? "Loading..." : "Confirm"}
        </Button>
      </form>
    </div>
  );
};

export default UserResetPassword;