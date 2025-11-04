import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";
import { useDepartments } from "../../Department/hooks/useDepartments";
import { useRoles } from "../../Roles/hooks/useRoles";
import { useEmployees } from "../../HR/hooks/useEmployees";

type Employee = {
  _id: string;
  name: string;
  jobTitle: string;
  nationalId: string;
  address: string;
  birthDate: string;
  email: string;
  phone: string;
  alternativePhone: string;
  department: string;
  workLocation: string;
  role: string;
  experienceLevel: string;
  employmentType: string;
  manager: string;
  salary: number;
  employmentDate: string;
  avatar?: string;
};

const ViewEmployeeScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/${id}`);
      const emp = res.data.data.employee;
      if (!emp) {
        toast.error("Employee not found");
        navigate(-1);
        return;
      }

      setEmployee({
        ...emp,
        birthDate: emp.birthDate?.split("T")[0],
        employmentDate: emp.employmentDate?.split("T")[0],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employee details");
    } finally {
      setLoading(false);
    }
  };

  const { departments } = useDepartments();
  const { roles } = useRoles();
  const { employees: allEmployees } = useEmployees();

  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const handleClose = () => navigate(-1);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading employee details...
      </div>
    );

  if (!employee)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No employee found.
      </div>
    );

  const departmentName =
    departments.find((d) => d._id === employee.department)?.name ??
    employee.department;

  const roleName =
roles.find((r) => r._id === employee.role)?.role ?? employee.role;

  const managerName =
    allEmployees.find((m) => m._id === employee.manager)?.name ??
    employee.manager;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">HR Management</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>Dashboard</span>
                <span>&gt;</span>
                <span>HR</span>
                <span>&gt;</span>
                <span>{employee.name}</span>
                <span>&gt;</span>
                <span>View</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Personal Details
          </h2>

          {/* Personal Info */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Employee Name
                </label>
                <div className="text-sm text-gray-900 py-2">{employee.name}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Job Title
                </label>
                <div className="text-sm text-gray-900 py-2">
                  {employee.jobTitle}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  National ID
                </label>
                <div className="text-sm text-gray-900 py-2">
                  {employee.nationalId}
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center overflow-hidden text-gray-400 mb-2 text-xs">
                {employee.avatar ? (
                  <img
                    src={employee.avatar}
                    alt="Employee Avatar"
                    className="w-full h-full object-contain object-center bg-gray-100"
                  />
                ) : (
                  <span>No image</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Address
              </label>
              <div className="text-sm text-gray-900 py-2">{employee.address}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Date of Birth
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.birthDate}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <div className="text-sm text-gray-900 py-2">{employee.email}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Phone
              </label>
              <div className="text-sm text-gray-900 py-2">{employee.phone}</div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Alternate Phone
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.alternativePhone}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">
            Job Details
          </h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Department
              </label>
              <div className="text-sm text-gray-900 py-2">{departmentName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Work Location
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.workLocation}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Position (Role)
              </label>
              <div className="text-sm text-gray-900 py-2">{roleName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Level of Experience
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.experienceLevel}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Employment Type
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.employmentType}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Manager
              </label>
              <div className="text-sm text-gray-900 py-2">{managerName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Salary
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.salary} EGP
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Date of Employment
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.employmentDate}
              </div>
            </div>
          </div>    
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeScreen;