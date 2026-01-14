import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";
import { useDepartments } from "../../Department/hooks/useDepartments";
import { useRoles } from "../../Roles/hooks/useRoles";
import { useEmployees } from "../../HR/hooks/useEmployees";
// استيراد دالة الترجمة
import { useTranslation } from "react-i18next"; 

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
  const { t } = useTranslation(); // استخدام hook الترجمة

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/${id}`);
      const emp = res.data.data.employee;
      if (!emp) {
        // رسالة خطأ مترجمة
        toast.error(t("employeeNotFound")); 
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
      // رسالة خطأ مترجمة
      toast.error(t("loadEmployeeDataFailed")); 
    } finally {
      setLoading(false);
    }
  };

  // افتراض أن هذه الدوال تعود بالبيانات المترجمة بالفعل أو يجب ترجمة القيم المعروضة يدويًا.
  // سنقوم هنا بتركها كما هي وافتراض أن الـ hooks لا تدعم الترجمة للتبسيط.
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
        {t("loadingEmployeeData")}
      </div>
    );

  if (!employee)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t("noEmployeeFound")}
      </div>
    );

  // منطق العرض لربط الـ IDs بالأسماء (مع افتراض أن الأسماء المحفوظة بالـ DB بالإنجليزية)
  // يفضل استخدام دالة مساعدة هنا لترجمة القيم المعروفة (مثل Department و Role و Manager)
  // سنقوم بتبسيط الترجمة هنا بالاعتماد على القيم المخزنة في الـ Dropdowns في ملف ar.ts
const departmentName =
  departments.find((d) => d._id === employee.department)?.name ??
  (t(`dept_${employee.department.replace(/\s/g, "")}` as any) ||
    employee.department);

const roleName =
  roles.find((r) => r._id === employee.role)?.role ??
  (t(`pos_${employee.role.toLowerCase()}` as any) ||
    employee.role);

const managerName =
  allEmployees.find((m) => m._id === employee.manager)?.name ??
  (t(`mgr_${employee.manager.replace(/\s/g, "")}` as any) ||
    employee.manager);

    // ترجمة قيم الـ Dropdowns المعروضة مباشرة
    const translatedWorkLocation = t(`loc_${employee.workLocation.replace(/\s/g, "").replace("-", "")}` as any) || employee.workLocation;
    const translatedExperienceLevel = t(`lvl_${employee.experienceLevel.replace(/\s/g, "").replace("-", "").toLowerCase()}` as any) || employee.experienceLevel;
    const translatedEmploymentType = t(`type_${employee.employmentType.replace(/-/g, "").toLowerCase()}` as any) || employee.employmentType;


  return (
    // إضافة dir="rtl" لضبط الاتجاه
    <div className="min-h-screen bg-gray-50" dir="rtl"> 
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t("hrManagement")}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{t("dashboard")}</span>
                <span>&lt;</span> {/* عكس اتجاه السهم لدعم RTL */}
                <span>{t("hr")}</span>
                <span>&lt;</span> {/* عكس اتجاه السهم لدعم RTL */}
                <span>{employee.name}</span>
                <span>&lt;</span> {/* عكس اتجاه السهم لدعم RTL */}
                <span>{t("view")}</span>
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
            {t("personalDetails")}
          </h2>

          {/* Personal Info */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("employeeName")}
                </label>
                <div className="text-sm text-gray-900 py-2">{employee.name}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("jobTitle")}
                </label>
                <div className="text-sm text-gray-900 py-2">
                  {employee.jobTitle}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("nationalId")}
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
                    alt={t("employeeName")}
                    className="w-full h-full object-contain object-center bg-gray-100"
                  />
                ) : (
                  <span>{t("noImage")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("address")}
              </label>
              <div className="text-sm text-gray-900 py-2">{employee.address}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("dateOfBirth")}
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.birthDate}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("email")}
              </label>
              <div className="text-sm text-gray-900 py-2">{employee.email}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("phone")}
              </label>
              <div className="text-sm text-gray-900 py-2">{employee.phone}</div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("alternatePhone")}
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.alternativePhone}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">
            {t("jobDetails")}
          </h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("department")}
              </label>
              <div className="text-sm text-gray-900 py-2">{departmentName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("workLocation")}
              </label>
              <div className="text-sm text-gray-900 py-2">
                {translatedWorkLocation}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("positionRole")}
              </label>
              <div className="text-sm text-gray-900 py-2">{roleName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("experienceLevel")}
              </label>
              <div className="text-sm text-gray-900 py-2">
                {translatedExperienceLevel}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("employmentType")}
              </label>
              <div className="text-sm text-gray-900 py-2">
                {translatedEmploymentType}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("manager")}
              </label>
              <div className="text-sm text-gray-900 py-2">{managerName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("salary")}
              </label>
              <div className="text-sm text-gray-900 py-2">
                {employee.salary} {t("currencyEGP")}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("dateOfEmployment")}
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