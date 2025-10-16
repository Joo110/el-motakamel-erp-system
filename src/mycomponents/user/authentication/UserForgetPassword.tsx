import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { publicAxiosInstance } from "../Services/Urls/Urls";
import { useNavigate } from "react-router-dom";



type FormData = {
  email: string;
};

const UserForgetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors,isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      
    },
  });


const navigate=useNavigate();
const onSubmit = async (data: { email: string }) => {
  const payload = {
    email: data.email,
  };

  console.log("Payload sent:", payload);

  try {
    const response = await publicAxiosInstance.post("/auth/forgetPassword", payload);
    toast.success(response.data.message || "Password reset email sent successfully");
    console.log("Response received:", response.data);
    navigate("/user-verification");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An error occurred during password reset.");
    }
  }
};



  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
<img src="/images/Logo.png" alt="Logo" className="w-24 h-auto mb-2" />
      <h2 className="text-black text-[32px] font-bold">
        Forget password
      </h2>
      <p className="text-gray-500 font-light text-[20px]">Enter your email to receive a password reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
    
        {/* Email */}
       

          <div className="w-full ">
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
                className="pl-9  border-[2px] border-[#213555]  rounded w-full"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
  
       <Button
        disabled={isSubmitting}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          
          {isSubmitting?"Loading...":"Send"}
        </Button>
     

      </form>
    </div>
  );
};

export default UserForgetPassword;
