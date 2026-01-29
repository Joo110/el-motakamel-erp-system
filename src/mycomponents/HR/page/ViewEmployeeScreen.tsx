import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, FileText, DownloadCloud, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";
import { useDepartments } from "../../Department/hooks/useDepartments";
import { useEmployees } from "../../HR/hooks/useEmployees";
import { useTranslation } from "react-i18next";

type Employee = {
  _id: string;
  name: string;
  jobTitle?: string;
  nationalId?: string;
  address?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  department?: any; // could be id or object
  workLocation?: any;
  role?: any;
  experienceLevel?: any;
  employmentType?: any;
  manager?: any;
  salary?: number;
  employmentDate?: string;
  avatar?: string;
  documents?: Array<{
    fileId?: string;
    viewLink?: string;
    downloadLink?: string;
    name?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
};

const ViewEmployeeScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleValue, setRoleValue] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // hooks (kept departments & employees; removed roles hook to avoid 404)
  const { departments } = useDepartments();
  const { employees: allEmployees } = useEmployees();

  // helper: safely get a string id or name from a field that might be string/object/number
  const getId = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (typeof v === "object") return String(v._id ?? v.id ?? "");
    return "";
  };

  // helper: ensure we only call .replace on strings
  const safeStr = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    return "";
  };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/${id}`);
      const payload: any = res?.data ?? {};
      const emp = payload?.data?.employee ?? payload?.data ?? payload?.employee ?? payload;
      if (!emp) {
        toast.error(t("employeeNotFound"));
        navigate(-1);
        return;
      }

      const normalized: Employee = {
        ...emp,
        birthDate: emp.birthDate ? String(emp.birthDate).split("T")[0] : emp.birthDate,
        employmentDate: emp.employmentDate ? String(emp.employmentDate).split("T")[0] : emp.employmentDate,
        documents: emp.documents ?? emp.data?.documents ?? emp.documents?.map?.((d: any) => d) ?? [],
      };

      setEmployee(normalized);
      setRoleValue(safeStr(normalized.role ?? ""));
    } catch (err) {
      console.error(err);
      toast.error(t("loadEmployeeDataFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // extract safe ids
  const departmentId = getId(employee.department);
  const managerId = getId(employee.manager);
  const workLocationStr = safeStr(employee.workLocation);
  const experienceLevelStr = safeStr(employee.experienceLevel);
  const employmentTypeStr = safeStr(employee.employmentType);

  // ربط الـ IDs بالأسماء مع فحوصات آمنة
  const departmentName =
    departments?.find((d: any) => String(d._id ?? d.id) === departmentId)?.name ??
    (departmentId ? t(`dept_${departmentId.replace(/\s/g, "")}` as any) : employee.department ?? t("notAvailable"));

  const managerName =
    allEmployees?.find((m: any) => String(m._id ?? m.id) === managerId)?.name ??
    (managerId ? (t(`mgr_${managerId.replace(/\s/g, "")}` as any) || managerId) : (typeof employee.manager === "string" ? employee.manager : employee.manager?.name ?? t("notAvailable")));

  const translatedWorkLocation =
    (workLocationStr ? (t(`loc_${workLocationStr.replace(/\s/g, "").replace("-", "")}` as any) || workLocationStr) : t("notAvailable")) ?? employee.workLocation;

  const translatedExperienceLevel =
    (experienceLevelStr ? (t(`lvl_${experienceLevelStr.replace(/\s/g, "").replace("-", "").toLowerCase()}` as any) || experienceLevelStr) : t("notAvailable")) ?? employee.experienceLevel;

  const translatedEmploymentType =
    (employmentTypeStr ? (t(`type_${employmentTypeStr.replace(/-/g, "").toLowerCase()}` as any) || employmentTypeStr) : t("notAvailable")) ?? employee.employmentType;

  // Documents handlers
  const onPreviewToggle = (doc: any) => {
    if (!doc?.viewLink) return;
    if (previewUrl === doc.viewLink) {
      setPreviewUrl(null);
    } else {
      setPreviewUrl(doc.viewLink);
      // scroll to preview (optional)
      setTimeout(() => {
        const el = document.getElementById("doc-preview");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t("hrManagement")}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{t("dashboard")}</span>
                <span>&lt;</span>
                <span>{t("hr")}</span>
                <span>&lt;</span>
                <span>{employee.name}</span>
                <span>&lt;</span>
                <span>{t("view")}</span>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-600 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">{t("personalDetails")}</h2>

          {/* Personal Info */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("employeeName")}</label>
                <div className="text-sm text-gray-900 py-2">{employee.name}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("jobTitle")}</label>
                <div className="text-sm text-gray-900 py-2">{employee.jobTitle}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("nationalId")}</label>
                <div className="text-sm text-gray-900 py-2">{employee.nationalId}</div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center overflow-hidden text-gray-400 mb-2 text-xs">
                {employee.avatar ? (
                  <img src={employee.avatar} alt={t("employeeName")} className="w-full h-full object-contain object-center bg-gray-100" />
                ) : (
                  <span>{t("noImage")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("address")}</label>
              <div className="text-sm text-gray-900 py-2">{employee.address}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("dateOfBirth")}</label>
              <div className="text-sm text-gray-900 py-2">{employee.birthDate}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("email")}</label>
              <div className="text-sm text-gray-900 py-2">{employee.email}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("phone")}</label>
              <div className="text-sm text-gray-900 py-2">{employee.phone}</div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("alternatePhone")}</label>
              <div className="text-sm text-gray-900 py-2">{employee.alternativePhone}</div>
            </div>
          </div>

          {/* Job Details */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">{t("jobDetails")}</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("department")}</label>
              <div className="text-sm text-gray-900 py-2">{departmentName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("workLocation")}</label>
              <div className="text-sm text-gray-900 py-2">{translatedWorkLocation}</div>
            </div>

            {/* Role as textbox (editable locally) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("positionRole")}</label>
              <input
                type="text"
                value={roleValue}
                onChange={(e) => setRoleValue(e.target.value)}
                className="w-full text-sm text-gray-900 py-2 border border-gray-200 rounded px-2"
                placeholder={t("positionRolePlaceholder") as string}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("experienceLevel")}</label>
              <div className="text-sm text-gray-900 py-2">{translatedExperienceLevel}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("employmentType")}</label>
              <div className="text-sm text-gray-900 py-2">{translatedEmploymentType}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("manager")}</label>
              <div className="text-sm text-gray-900 py-2">{managerName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("salary")}</label>
              <div className="text-sm text-gray-900 py-2">
                {employee.salary} {t("currencyEGP")}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("dateOfEmployment")}</label>
              <div className="text-sm text-gray-900 py-2">{employee.employmentDate}</div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("documents") ?? "Documents"}</h3>

            <div className="bg-white border rounded p-3 space-y-2">
              {Array.isArray(employee.documents) && employee.documents.length > 0 ? (
                employee.documents.map((doc, idx) => (
                  <div key={doc.fileId ?? idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <FileText size={18} />
                      <div>
<div className="text-sm font-medium text-gray-900">
  {doc.name ?? `${t("document")} ${idx + 1}`}
</div>
                        <div className="text-xs text-gray-500">{doc.fileId ?? ""}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.viewLink && (
                        <button
                          onClick={() => onPreviewToggle(doc)}
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Eye size={14} /> <span>{t("view") ?? "View"}</span>
                        </button>
                      )}

                      {doc.downloadLink && (
                        <a
                          href={doc.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-800 inline-flex items-center gap-1"
                        >
                          <DownloadCloud size={14} /> <span>{t("download") ?? "Download"}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">{t("noDocuments") ?? "No documents uploaded."}</div>
              )}
            </div>

            {/* Preview iframe */}
            {previewUrl && (
              <div id="doc-preview" className="mt-4">
                <div className="text-xs text-gray-500 mb-2">{t("preview") ?? "Preview"}</div>
                <div className="w-full h-[600px] border rounded overflow-hidden">
                  {/* iframe for preview — قد يحتاج link أن يكون publicly accessible */}
                  <iframe
                    src={previewUrl}
                    title="document-preview"
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeScreen;
