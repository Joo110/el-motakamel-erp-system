import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

type FormData = {
  code: string;
};

const UserVerification = () => {
  const { handleSubmit, formState: { isSubmitting } } = useForm<FormData>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<any[]>([]);
  const navigate = useNavigate();
  const { verifyCode, loading } = useVerification();

  useEffect(() => {
    if (inputsRef.current[0]) {
      try {
        inputsRef.current[0].focus();
      } catch {
        // no-op
      }
    }
  }, []);

  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    if (value && idx < inputsRef.current.length - 1) {
      const next = inputsRef.current[idx + 1];
      if (next && typeof next.focus === "function") next.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    const key = e.key;

    if (key === "Backspace") {
      if (code[idx]) {
        const newCode = [...code];
        newCode[idx] = "";
        setCode(newCode);
      } else if (idx > 0) {
        const prev = inputsRef.current[idx - 1];
        if (prev && typeof prev.focus === "function") prev.focus();
      }
      return;
    }

    if (key === "ArrowLeft" && idx > 0) {
      const prev = inputsRef.current[idx - 1];
      if (prev && typeof prev.focus === "function") prev.focus();
      return;
    }

    if (key === "ArrowRight" && idx < inputsRef.current.length - 1) {
      const next = inputsRef.current[idx + 1];
      if (next && typeof next.focus === "function") next.focus();
      return;
    }

    if (key.length === 1 && !/^[0-9]$/.test(key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("Text") || "";
    const digits = paste.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length === 0) return;

    const newCode = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      newCode[i] = d;
      const ref = inputsRef.current[i];
      if (ref) {
        try {
          // If Input forwards native input, set value; otherwise ignore
          if (typeof ref.value !== "undefined") ref.value = d;
        } catch {
          // ignore
        }
      }
    });
    setCode(newCode);

    const nextIndex = Math.min(digits.length, inputsRef.current.length - 1);
    const next = inputsRef.current[nextIndex];
    if (next && typeof next.focus === "function") next.focus();

    e.preventDefault();
  };

  const onSubmit = async () => {
    const resetCode = code.join("");
    if (!/^\d{6}$/.test(resetCode)) {
      toast.error("Please enter a 6-digit verification code.");
      return;
    }

    try {
      const response = await verifyCode(resetCode);
      toast.success(response?.message || "Verification successful 🎉");
      navigate("/user-reset-password");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid or expired verification code ❌";
      toast.error(msg);
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
                inputsRef.current[idx] = el;
              }}
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value.replace(/\s/g, ""), idx)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
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