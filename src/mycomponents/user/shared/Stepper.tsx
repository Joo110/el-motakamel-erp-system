"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  totalSteps: number
  currentStep: number
}

export function Stepper({ totalSteps, currentStep }: StepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center mt-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          {/* Circle */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              s <= currentStep
                ? "bg-[#213555] border-[#213555] text-white"
                : "border-gray-300 text-gray-500"
            )}
          >
            {s < currentStep ? <Check size={18} /> : s}
          </div>

          {/* Line between steps */}
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-1 w-14 mx-2 rounded-full transition-all duration-300",
                s < currentStep ? "bg-[#213555]" : "bg-gray-300"
              )}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}
