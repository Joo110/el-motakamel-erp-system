
import { Input } from "@/components/ui/input"
import {  ChevronDown, Briefcase,Flag } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import {  DatePicker } from "../../shared/DatePicker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
interface Step1Props {
  register: any
  errors: any
  setValue: any
  countries: { code: string; flag: string }[]
}

 const StepOneForm = ({ register, errors, setValue, countries }: Step1Props) => {
  const [selected, setSelected] = useState(countries[0])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-4">
      <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
       Supplier ID
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex w-full items-center justify-between border border-gray-400 rounded px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span>Supplier Id</span>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-gray-200 shadow-md">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
      {/* Organization ID */}
       <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Organization ID
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex w-full items-center justify-between border border-gray-400 rounded px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span>Organization ID</span>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-gray-200 shadow-md">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
      {/* Invoice Number*/}
      <div className="w-full relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Invoice Number
        </label>
        <div className="relative">
          <Input
            {...register("phone.phoneNumber", {
              required: "Invoice Number is required",
              pattern: {
                value: /^[0-9]{6,15}$/,
                message: "Enter a valid phone number",
              },
            })}
            type="text"
            placeholder="Invoice Number"
            className="pl-9 pr-20 border border-gray-400 rounded w-full"
          />
          <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="absolute right-0 top-0 h-full flex items-center justify-center px-3 bg-gray-300 border-r border-gray-100 rounded-r"
          >
            {selected.flag} <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-20 bg-white border rounded shadow-md z-50">
              {countries.map((c) => (
                <div
                  key={c.code}
                  className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-center"
                  onClick={() => {
                    setSelected(c)
                    setValue("phone.countryCode", c.code)
                    setOpen(false)
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
      {/* Invoice Date */}
      <div >
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Invoice Date
      </label>
        <DatePicker />
      </div>

      {/* Status */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            {...register("role", { required: "Status is required" })}
            type="text"
            placeholder="Enter your Status"
            className="pl-9 border border-gray-400 rounded"
          />
        </div>
        {errors.role && (
          <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
        )}
      </div>
    </div>
  )
}
export default StepOneForm