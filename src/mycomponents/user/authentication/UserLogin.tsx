import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

type FormData = {
  email: string;
  password: string;
};

const UserLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    toast.success("Login successful (Dev Mode)");
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
<img
  src="/public/images/Logo.png"
  alt="Logo"
  className="w-24 h-auto mb-2"
/>
      <h2 className="text-black text-[32px] font-bold">
        Welcome back! Please log in to continue.
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        {/* Email */}
        <div className="w-full ">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("email")}
              type="text"
              placeholder="Enter your email"
              className="pl-9 border-[2px] border-[#213555] rounded w-full "
            />
          </div>
        </div>

        {/* Password */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              className="pl-9 border-[2px] border-[#213555] rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4 text-right">
          <Link
            to="/user-forget-password"
            className="text-[#213555] hover:text-[#1a2b45] font-medium"
          >
            Forget Password
          </Link>
        </p>

        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting ? "Loading..." : "Login"}
        </Button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don't have an account?{" "}
          <Link
            to="/user-register"
            className="text-[#213555] hover:text-[#1a2b45] font-medium"
          >
            Create a new account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;