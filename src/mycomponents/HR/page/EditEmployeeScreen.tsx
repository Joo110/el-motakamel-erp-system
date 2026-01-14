import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";
// استيراد دالة الترجمة
import { useTranslation } from "react-i18next"; 

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
  const { t } = useTranslation(); // استخدام hook الترجمة

  const [formData, setFormData] = useState<EmployeeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  // الصورة الحالية / المرفوعة
  const [image, setImage] = useState<string | null>(null);
  const [imageFile] = useState<File | null>(null); // تركها كما هي لتبسيط عملية التعديل (لكن يفضل استخدامها في حالة التغيير)

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

      if (emp?.avatar) {
        const avatarVal = String(emp.avatar);
        if (/^https?:\/\//.test(avatarVal)) setImage(avatarVal);
        else setImage(avatarVal);
      } else {
        setImage(null);
      }
    } catch (err) {
      console.error(err);
      // ترجمة رسالة الخطأ
      toast.error(t("loadEmployeeDataFailed")); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEmployee();
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

      // ترجمة رسالة النجاح
      toast.success(t("updateSuccess")); 
      navigate(-1);
    } catch (err: any) {
      console.error("Update failed", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("updateFailedGeneric"); // رسالة فشل عامة مترجمة

      if (message.includes("E11000 duplicate key error")) {
        if (message.includes("email")) {
          toast.error(t("duplicateEmail"));
        } else if (message.includes("phone")) {
          toast.error(t("duplicatePhone"));
        } else if (message.includes("alternativePhone")) {
          toast.error(t("duplicateAlternatePhone"));
        } else {
          toast.error(t("duplicateFieldDetected"));
        }
      } else {
        toast.error(String(message));
      }
    }
  };

  const handleCancel = () => navigate(-1);

  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t("loadingEmployeeData")}
      </div>
    );
  }

  return (
    // إضافة dir="rtl" لضبط الاتجاه
    <div className="min-h-screen bg-gray-50" dir="rtl"> 
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("hrManagement")}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>{t("dashboard")}</span>
            <span>&lt;</span> {/* عكس اتجاه السهم لدعم RTL */}
            <span>{t("hr")}</span>
            <span>&lt;</span> {/* عكس اتجاه السهم لدعم RTL */}
            <span>{formData.name}{t("editSuffix")}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {t("personalDetails")}
          </h2>

          {/* Personal Details Grid */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("employeeName")}
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
                  {t("jobTitle")}
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
                  {t("nationalId")}
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

            {/* Image Upload Section (ثابت في العمود الأيسر في RTL) */}
            <div>
              <div className="w-full h-36 bg-white rounded flex items-center justify-center text-gray-400 mb-2 text-xs overflow-hidden border border-gray-300">
                {image ? (
                  <img
                    src={image}
                    alt={t("imagePreview")}
                    className="w-full h-full object-contain object-center bg-white"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">{t("imagePreview")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("address")}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("dateOfBirth")}</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("email")}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("phone")}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("alternatePhone")}</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Job Details Section */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">{t("jobDetails")}</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("department")}</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                {/* قيمة الخيار (Value) تبقى بالإنجليزية، لكن النص (Content) يتم ترجمته */}
                <option value="Sales">{t("dept_sales")}</option>
                <option value="Technical Support">{t("dept_techSupport")}</option>
                <option value="HR">{t("dept_hr")}</option>
                <option value="Software">{t("dept_software")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("workLocation")}</label>
              <select
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Cairo office">{t("loc_cairoOffice")}</option>
                <option value="Alex Branch">{t("loc_alexBranch")}</option>
                <option value="Capital office">{t("loc_capitalOffice")}</option>
                <option value="Mansoura office">{t("loc_mansouraOffice")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("position")}</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Employee">{t("pos_employee")}</option>
                <option value="Manager">{t("pos_manager")}</option>
                <option value="Director">{t("pos_director")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("experienceLevel")}</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Junior">{t("lvl_junior")}</option>
                <option value="Mid-Level">{t("lvl_midLevel")}</option>
                <option value="Senior">{t("lvl_senior")}</option>
                <option value="Director">{t("lvl_director")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("employmentType")}</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Full-Time">{t("type_fullTime")}</option>
                <option value="Part-Time">{t("type_partTime")}</option>
                <option value="Project-Based">{t("type_projectBased")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("manager")}</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Ahmed Hassan">{t("mgr_ahmedHassan")}</option>
                <option value="Mohamed Ali">{t("mgr_mohamedAli")}</option>
                <option value="Aali Hassan">{t("mgr_aaliHassan")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("salary")}</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("dateOfEmployment")}</label>
              <input
                type="date"
                value={formData.dateOfEmployment}
                onChange={(e) => setFormData({ ...formData, dateOfEmployment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-start gap-3 mt-6"> {/* عكس ترتيب الأزرار بـ justify-start في RTL */}
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
            >
              {t("saveDetails")}
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeScreen;