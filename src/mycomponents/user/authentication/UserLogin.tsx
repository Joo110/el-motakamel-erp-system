import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/mycomponents/user/hooks/useLogin";

const loginSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email address"),
  password: z.string().nonempty("Password is required").min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof loginSchema>;

const UserLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, loading } = useLogin();

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const onSubmit = async (data: FormData) => {
  try {
    const response = await login(data.email, data.password);

    if (response.token || response.accessToken) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Login failed: No token received");
    }
  } catch (err: any) {
    const errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Invalid email or password";

    toast.error(errorMessage);
    console.error("Login error:", err);
  }
};


  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
      <img src="/images/Logo.png" alt="Logo" className="w-24 h-auto mb-2" />
      <h2 className="text-black text-[32px] font-bold">
        Welcome back! Please log in to continue.
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="pl-9 border-[2px] border-[#213555] rounded w-full"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

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
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-4 text-right">
          <Link to="/user-forget-password" className="text-[#213555] hover:text-[#1a2b45] font-medium">
            Forget Password
          </Link>
        </p>

        <Button
          disabled={isSubmitting || loading}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting || loading ? "Loading..." : "Login"}
        </Button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/user-register" className="text-[#213555] hover:text-[#1a2b45] font-medium">
            Create a new account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
