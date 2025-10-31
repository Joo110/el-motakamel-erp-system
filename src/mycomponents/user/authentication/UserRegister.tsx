import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  User,
  Mail,
  ChevronDown,
  Lock,
  EyeOff,
  Eye,
  Briefcase,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-hot-toast';
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";

const countries = [
  { code: "+20", flag: "🇪🇬" },
  { code: "+966", flag: "🇸🇦" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+1", flag: "🇺🇸" },
];

type FormData = {
  fullname: string;
  email: string;
  phone: {
    countryCode: string;
    phoneNumber: string;
  };
  password: string;
  confirmPassword: string;
  organizations: string[];
  role: string;
};

const UserRegister = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      phone: { countryCode: countries[0].code, phoneNumber: "" },
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, confirmPassword, trigger]);

  const [selected, setSelected] = useState(countries[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: doRegister, loading } = useRegister();

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      organizations: data.organizations || [],
    };

    console.log("Payload sent:", payload);

    try {
      const response = await doRegister(payload);
      toast.success(response.message || "Registration successfully");
      reset({
        fullname: "",
        email: "",
        phone: { countryCode: countries[0].code, phoneNumber: "" },
        password: "",
        confirmPassword: "",
        role: "",
        organizations: [],
      });
      console.log("Response received:", response);
    } catch (err) {
      // err ممكن تكون AxiosError أو Error أو unknown — الهوك تعالج الخطأ وطرحت الاستثناء
      if (typeof err === "object" && err !== null && "response" in err) {
        // محاولة آمنة لاستخراج رسالة من Axios error
        // @ts-expect-error - هنا مجرد محاولة قراءة حقل response
        const serverMsg = err.response?.data?.status ?? undefined;
        if (serverMsg) {
          toast.error(serverMsg);
          return;
        }
      }
      toast.error("An error occurred during registration.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
      <img src="/images/Logo.png" alt="Logo" className="w-24 h-auto mb-2" />
      <h2 className="text-black text-[32px] font-bold">
        Start managing your business efficiently
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        {/* Full name & Email */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("fullname", { required: "Full name is required" })}
                type="text"
                placeholder="Enter your full name"
                className="pl-9 border border-gray-400 rounded w-full"
              />
            </div>
            {errors.fullname && (
              <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>
            )}
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                type="text"
                placeholder="Enter your email"
                className="pl-9 border border-gray-400 rounded w-full"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="w-full relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            {/* Input */}
            <Input
              {...register("phone.phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{6,15}$/,
                  message: "Enter a valid phone number",
                },
              })}
              type="text"
              placeholder="Enter your phone number"
              className="pl-9 pr-20 border border-gray-400 rounded w-full"
            />

            {/* Phone icon */}
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            {/* Dropdown button */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="absolute right-0 top-0 h-full flex items-center justify-center px-3 bg-gray-300 border-r border-gray-100 rounded-r"
            >
              {selected.flag} <ChevronDown className="w-4 h-4 ml-1" />
            </button>

            {/* Dropdown menu */}
            {open && (
              <div className="absolute right-0 top-full mt-1 w-20 bg-white border rounded shadow-md z-50">
                {countries.map((c) => (
                  <div
                    key={c.code}
                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-center"
                    onClick={() => {
                      setSelected(c);
                      setValue("phone.countryCode", c.code);
                      setOpen(false);
                    }}
                  >
                    {c.flag}
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.phone?.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phone.phoneNumber.message}
            </p>
          )}
        </div>

        {/* role */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              {...register("role", { required: "Role is required" })}
              type="text"
              placeholder="Enter your role"
              className="pl-9 border border-gray-400 rounded"
            />
          </div>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
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
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              className="pl-9 border border-gray-400 rounded"
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
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
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
                validate: (value) => value === watch("password") || "Passwords do not match",
              })}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="pl-9 border border-gray-400 rounded"
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
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          disabled={isSubmitting || loading}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting || loading ? "Loading..." : "Register"}
        </Button>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/user-login" className="text-[#213555] hover:text-[#1a2b45] font-medium">
            Access your account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default UserRegister;