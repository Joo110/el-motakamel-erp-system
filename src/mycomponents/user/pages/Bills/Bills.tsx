"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { toast } from "react-toastify"
import { useState } from "react"
import StepOneForm from "./StepOneForm"
import { Stepper } from "../../shared/Stepper"
// import { publicAxiosInstance } from "../../Services/Urls/Urls"

const countries = [
  { code: "+20", flag: "🇪🇬" },
  { code: "+966", flag: "🇸🇦" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+1", flag: "🇺🇸" },
]

type FormData = {
  phone: { countryCode: string; phoneNumber: string }
  role: string
}

const Bills = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { phone: { countryCode: countries[0].code, phoneNumber: "" } },
  })

  const [step, setStep] = useState(1)
  const nextStep = () => setStep((s) => Math.min(s + 1, 3))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data: FormData) => {
    console.log("Form Data:", data)
    if (step === 1) {
      try {
        // const response = await publicAxiosInstance.post("/users/register", data)
        // toast.success(response.data.status || "Registration successful")
        nextStep()
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.message)
          toast.error(error.response.data.status)
        else toast.error("Error during registration.")
      }
    } else if (step === 2) {
      nextStep()
    } else if (step === 3) {
      toast.success("✅ All steps completed!")
    }
  }

  return (
    <div className="flex flex-col items-start space-y-6 max-w-md mx-auto mt-10">
<img src="/images/Logo.png" alt="Logo" className="w-24 h-auto mb-2" />
      <h2 className="text-black text-[32px] font-bold">Invoice Information</h2>


      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <StepOneForm
            register={register}
            errors={errors}
            setValue={setValue}
            countries={countries}
          />
          <div >
            <Button
              type="submit"
              disabled={isSubmitting}
          className="w-full bg-[#213555] hover:bg-[#1a2b45] text-white transition-colors duration-200 rounded"
            >
              {isSubmitting ? "Loading..." : "Next"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <p>Step 2 content </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button type="submit" className="bg-[#213555] hover:bg-[#1a2b45]">
              Next
            </Button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <p>Step 3 content </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Submit
            </Button>
          </div>
        </form>
      )}
      <div className="w-full flex justify-center mb-3">
  <Stepper totalSteps={3} currentStep={step} />
</div>
    </div>
  )
}

export default Bills
