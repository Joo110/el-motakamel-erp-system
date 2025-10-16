import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, EyeOff, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { publicAxiosInstance } from "../Services/Urls/Urls";

type FormData = {
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
  } = useForm<FormData>({
    defaultValues: {},
  });

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
    const payload = {
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    console.log("Payload sent:", payload);

    try {
      const response = await publicAxiosInstance.post(
        "/users/resetPassword",
        payload
      );
      toast.success(response.data.status || "Password reset successfully");

      console.log("Response received:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.status);
      } else {
        toast.error("An error occurred during Update Password.");
      }
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
                  value: 6,
                  message: "Password must be at least 6 characters",
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
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        {/* confirm Password */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("confirmPassword", {
                required: "confirm Password is required",
                minLength: {
                  value: 6,
                  message: "confirm Password must be at least 6 characters",
                },
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
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting ? "Loading..." : "Confirm"}
        </Button>
      </form>
    </div>
  );
};

export default UserResetPassword;
