import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { publicAxiosInstance } from "../Services/Urls/Urls";
import { useNavigate } from "react-router-dom";

type FormData = {
  code: string;
};

const UserVerification = () => {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const handleChange = (value: string, idx: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[idx] = value;
      setCode(newCode);

      if (value && idx < inputsRef.current.length - 1) {
        inputsRef.current[idx + 1].focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const onSubmit = async () => {
    const payload = { resetCode: code.join("") };
    try {
      const response = await publicAxiosInstance.post(
        "/auth/verifiedPassword",
        payload
      );
      toast.success(response.data.message || "Verification successful");
      navigate("/user-reset-password");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred during verification.");
      }
    }
  };

  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
<img src="/images/Logo.png" alt="Logo" className="w-24 h-auto mb-2" />
      <h2 className="text-black text-[32px] font-bold">Verification</h2>
      <p className="text-gray-500 font-light text-[20px]">
        Enter the verification code sent to your email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="flex justify-between gap-3 mb-4">
          {code.map((digit, idx) => (
            <Input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el!;
              }}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="flex-1 h-16 text-center text-xl  border-[2px] border-[#213555] rounded"
            />
          ))}
        </div>

        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting ? "Loading..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default UserVerification;
