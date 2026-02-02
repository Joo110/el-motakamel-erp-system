import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type FormData = {
  code: string;
};

const UserVerification = () => {
  const { handleSubmit, formState: { isSubmitting } } = useForm<FormData>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (code[idx]) {
        const newCode = [...code];
        newCode[idx] = "";
        setCode(newCode);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }

    if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }

    if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("Text") || "";
    const digits = paste.replace(/\D/g, "").slice(0, 6).split("");

    if (!digits.length) return;

    const newCode = ["", "", "", "", "", ""];
    digits.forEach((d, i) => (newCode[i] = d));
    setCode(newCode);

    inputsRef.current[Math.min(digits.length, 5)]?.focus();
    e.preventDefault();
  };

  const onSubmit = async () => {
    const resetCode = code.join("");

    if (!/^\d{6}$/.test(resetCode)) {
      toast.error("Please enter a 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/v1/forgetPassword/verifyResetCode",
        { resetCode }
      );

      toast.success(res?.data?.message || "Verification successful 🎉");
      navigate("/user-reset-password");

    } catch (err: any) {
      const resData = err?.response?.data;

      // لو السيرفر رجع validation errors array
      if (Array.isArray(resData?.errors)) {
        resData.errors.forEach((e: any) => {
          toast.error(e.msg);
        });
        inputsRef.current[0]?.focus();
        return;
      }

      // fallback message
      toast.error(
        resData?.message ||
        err?.message ||
        "Invalid or expired verification code ❌"
      );
    } finally {
      setLoading(false);
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
ref={(el) => void (inputsRef.current[idx] = el)}
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className="flex-1 h-16 text-center text-xl border-[2px] border-[#213555] rounded"
            />
          ))}
        </div>

        <Button
          disabled={isSubmitting || loading}
          type="submit"
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white rounded"
        >
          {isSubmitting || loading ? "Loading..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default UserVerification;
