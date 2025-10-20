import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

type FormData = {
  code: string;
};

const UserVerification = () => {
  const { handleSubmit, formState: { isSubmitting } } = useForm<FormData>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const { verifyCode, loading } = useVerification();

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const onSubmit = async () => {
    const resetCode = code.join("");
    try {
      const response = await verifyCode(resetCode);
      toast.success(response.message || "Verification successful 🎉");
      navigate("/user-reset-password");
    } catch {
      toast.error("Invalid or expired verification code ❌");
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
              className="flex-1 h-16 text-center text-xl border-[2px] border-[#213555] rounded"
            />
          ))}
        </div>

        <Button
          disabled={isSubmitting || loading}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
        >
          {isSubmitting || loading ? "Loading..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default UserVerification;