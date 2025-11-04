import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";

type EmployeeFormData = {
  name: string;
  jobTitle: string;
  nationalId: string;
  address: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  alternatePhone: string;
  department: string;
  workLocation: string;
  role: string;
  level: string;
  employmentType: string;
  manager: string;
  salary: string;
  dateOfEmployment: string;
  avatar?: string;
};

const EditEmployeeScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EmployeeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  // الصورة الحالية / المرفوعة
  const [image, setImage] = useState<string | null>(null);
  const [imageFile] = useState<File | null>(null);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/${id}`);
      const emp = res.data?.data?.employee;

      setFormData({
        name: emp?.name || "",
        jobTitle: emp?.jobTitle || "",
        nationalId: emp?.nationalId || "",
        address: emp?.address || "",
        dateOfBirth: emp?.birthDate ? emp.birthDate.split("T")[0] : "",
        email: emp?.email || "",
        phone: emp?.phone || "",
        alternatePhone: emp?.alternativePhone || "",
        department: emp?.department || "",
        workLocation: emp?.workLocation || "",
        role: emp?.role || "",
        level: emp?.experienceLevel
          ? emp.experienceLevel.charAt(0).toUpperCase() + emp.experienceLevel.slice(1)
          : "",
        employmentType: emp?.employmentType || "",
        manager: emp?.manager || "",
        salary: emp?.salary?.toString() || "",
        dateOfEmployment: emp?.employmentDate ? emp.employmentDate.split("T")[0] : "",
        avatar: emp?.avatar || "",
      });

      // show avatar if exists (handle absolute/relative)
      if (emp?.avatar) {
        const avatarVal = String(emp.avatar);
        if (/^https?:\/\//.test(avatarVal)) setImage(avatarVal);
        else setImage(avatarVal); // إذا الباك يعيد رابط نسبي عّدّل حسب VITE_API_URL إذا لازم
      } else {
        setImage(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);



  const handleSave = async () => {
    if (!formData) return;

    try {
      if (imageFile) {
        const form = new FormData();
        form.append("name", formData.name);
        form.append("jobTitle", formData.jobTitle);
        form.append("nationalId", formData.nationalId);
        form.append("address", formData.address);
        if (formData.dateOfBirth) form.append("birthDate", formData.dateOfBirth);
        form.append("email", formData.email);
        form.append("phone", formData.phone);
        form.append("alternativePhone", formData.alternatePhone);
        form.append("department", formData.department);
        form.append("workLocation", formData.workLocation);
        form.append("role", formData.role);
        form.append("experienceLevel", formData.level);
        form.append("employmentType", formData.employmentType);
        form.append("manager", formData.manager);
        if (formData.salary) form.append("salary", formData.salary);
        if (formData.dateOfEmployment) form.append("employmentDate", formData.dateOfEmployment);

        form.append("avatar", imageFile);

        await axiosClient.patch(`/employees/${id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // لا توجد صورة جديدة -> نرسل JSON (أبسط للباك إن كان يتوقع JSON)
        const payload: Record<string, any> = {
          name: formData.name,
          jobTitle: formData.jobTitle,
          nationalId: formData.nationalId,
          address: formData.address,
          birthDate: formData.dateOfBirth || undefined,
          email: formData.email,
          phone: formData.phone,
          alternativePhone: formData.alternatePhone,
          department: formData.department,
          workLocation: formData.workLocation,
          role: formData.role,
          experienceLevel: formData.level,
          employmentType: formData.employmentType,
          manager: formData.manager,
          salary: formData.salary || undefined,
          employmentDate: formData.dateOfEmployment || undefined,
          avatar: formData.avatar === "" ? null : undefined,
        };

        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

        await axiosClient.patch(`/employees/${id}`, payload);
      }

      toast.success("Employee updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to update employee";
      toast.error(String(message));
    }
  };

  const handleCancel = () => navigate(-1);

  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading employee data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>HR</span>
            <span>&gt;</span>
            <span>{formData.name}.Edit</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Personal Details
          </h2>

          {/* Personal Details Grid */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  National Id
                </label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) =>
                    setFormData({ ...formData, nationalId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Image Upload Section (ثابت في العمود الأيمن) */}
            <div>
              <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-2 text-xs overflow-hidden border border-gray-300">
                {image ? (
                  <img
                    src={image}
                    alt="Employee avatar preview"
                    className="w-full h-full object-contain object-center bg-gray-100"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Image preview</span>
                )}
              </div>

              
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Alternate Phone</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Job Details Section */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">Job Details</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Sales">Sales</option>
                <option value="Technical Support">Technical Support</option>
                <option value="HR">HR</option>
                <option value="Software">Software</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Work Location</label>
              <select
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Cairo office">Cairo office</option>
                <option value="Alex Branch">Alex Branch</option>
                <option value="Capital office">Capital office</option>
                <option value="Mansoura office">Mansoura office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Level of Experience</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Director">Director</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Full-Time">Full Time</option>
                <option value="Part-Time">Part Time</option>
                <option value="Project-Based">Project Based</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Ahmed Hassan">Ahmed Hassan</option>
                <option value="Mohamed Ali">Mohamed Ali</option>
                <option value="Aali Hassan">Aali Hassan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Employment</label>
              <input
                type="date"
                value={formData.dateOfEmployment}
                onChange={(e) => setFormData({ ...formData, dateOfEmployment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeScreen;
