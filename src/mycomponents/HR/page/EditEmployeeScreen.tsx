import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";
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
  department: string; // will hold ObjectId
  workLocation: string;
  role: string;
  level: string;
  employmentType: string;
  manager: string; // will hold ObjectId
  salary: string;
  dateOfEmployment: string;
  avatar?: string;
};

const EditEmployeeScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<EmployeeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [managersList, setManagersList] = useState<any[]>([]);

  // safe helpers
  const safeStr = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (typeof v === "object") {
      if (v.name) return String(v.name);
      if (v.title) return String(v.title);
      if (v._id) return String(v._id);
    }
    return "";
  };

  const safeId = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (typeof v === "object") {
      return String(v._id ?? v.id ?? "");
    }
    return "";
  };

  const formatDateInput = (v: any): string => {
    if (!v) return "";
    try {
      const s = String(v);
      if (s.includes("T")) return s.split("T")[0];
      return s;
    } catch {
      return "";
    }
  };

  // clean phone: remove non-digits and leading plus/spaces
  const cleanPhone = (v?: string) => {
    if (!v) return "";
    const s = String(v);
    const onlyDigits = s.replace(/\D/g, "");
    return onlyDigits;
  };

  // fetch lists (departments + managers)
  const fetchLists = async () => {
    try {
      // departments
      try {
        const res = await axiosClient.get("/departments");
        const payload: any = res?.data ?? {};
        const list = payload?.data ?? payload;
        if (Array.isArray(list)) setDepartmentsList(list);
        else if (Array.isArray(list?.departments)) setDepartmentsList(list.departments);
      } catch (err) {
        console.warn("Could not load departments list", err);
      }

      // managers: try filter by role=manager; fallback to all employees and filter
      try {
        const res = await axiosClient.get("/employees", { params: { role: "manager", limit: 100 } });
        const payload: any = res?.data ?? {};
        const list = payload?.data ?? payload;
        if (Array.isArray(list)) {
          setManagersList(list);
        } else if (Array.isArray(list?.data)) {
          setManagersList(list.data);
        } else if (Array.isArray(payload?.employees)) {
          setManagersList(payload.employees);
        } else {
          // fallback: get all employees and filter
          const all = await axiosClient.get("/employees");
          const p2: any = all?.data ?? {};
          const arr = p2?.data ?? p2;
          if (Array.isArray(arr)) {
            setManagersList(arr.filter((e: any) => (e.role ?? "").toLowerCase().includes("manager")));
          }
        }
      } catch (err) {
        console.warn("Could not load managers list", err);
      }
    } catch (ignored) {
      console.error("fetchLists error:", ignored);
    }
  };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/${id}`);
      const payload: any = res?.data ?? {};
      const emp: any =
        payload?.data?.employee ?? payload?.data ?? payload?.employee ?? payload;

      if (!emp) {
        toast.error(t("employeeNotFound"));
        navigate(-1);
        return;
      }

      // department and manager should be stored as IDs in the form
      const departmentId = safeId(emp.department);
      const managerId = safeId(emp.manager);
      const roleVal = emp.role && typeof emp.role === "object" ? safeStr(emp.role.name ?? emp.role.role) : safeStr(emp.role);

      const normalized: EmployeeFormData = {
        name: safeStr(emp.name),
        jobTitle: safeStr(emp.jobTitle),
        nationalId: safeStr(emp.nationalId ?? emp.nationalID ?? emp.national_id),
        address: safeStr(emp.address),
        dateOfBirth: formatDateInput(emp.birthDate ?? emp.dateOfBirth ?? emp.dob),
        email: safeStr(emp.email),
        phone: cleanPhone(emp.phone),
        alternatePhone: cleanPhone(emp.alternativePhone ?? emp.alternatePhone ?? emp.altPhone ?? ""),
        department: departmentId || "",
        workLocation: safeStr(emp.workLocation ?? emp.location),
        role: roleVal || "",
        level: safeStr(emp.experienceLevel ?? emp.levelOfExperience ?? emp.level),
        employmentType: safeStr(emp.employmentType ?? emp.type),
        manager: managerId || "",
        salary: emp.salary != null ? String(emp.salary) : "",
        dateOfEmployment: formatDateInput(emp.employmentDate ?? emp.dateOfEmployment ?? emp.joinDate),
        avatar: safeStr(emp.avatar ?? emp.profilePic ?? emp.image),
      };

      setFormData(normalized);

      if (normalized.avatar) {
        const avatarVal = String(normalized.avatar);
        setImage(/^https?:\/\//.test(avatarVal) ? avatarVal : avatarVal);
      } else {
        setImage(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("loadEmployeeDataFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
    if (id) fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!formData) return;

    try {
      // validate department & manager presence (server expects ObjectId)
      // don't force, but warn
      if (!formData.department) {
        toast.error(t("validation_department_required") || "Department is required");
        return;
      }
      // clean phones
      const cleanedPhone = cleanPhone(formData.phone);
      const cleanedAlt = cleanPhone(formData.alternatePhone);

      if (imageFile) {
        const form = new FormData();
        form.append("name", formData.name);
        form.append("jobTitle", formData.jobTitle);
        form.append("nationalId", formData.nationalId);
        form.append("address", formData.address);
        if (formData.dateOfBirth) form.append("birthDate", formData.dateOfBirth);
        form.append("email", formData.email);
        form.append("phone", cleanedPhone);
        form.append("alternativePhone", cleanedAlt);
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
        // JSON payload
        const payload: Record<string, any> = {
          name: formData.name,
          jobTitle: formData.jobTitle,
          nationalId: formData.nationalId,
          address: formData.address,
          birthDate: formData.dateOfBirth || undefined,
          email: formData.email,
          phone: cleanedPhone || undefined,
          alternativePhone: cleanedAlt || undefined,
          department: formData.department || undefined,
          workLocation: formData.workLocation || undefined,
          role: formData.role || undefined,
          experienceLevel: formData.level || undefined,
          employmentType: formData.employmentType || undefined,
          manager: formData.manager || undefined,
          salary: formData.salary || undefined,
          employmentDate: formData.dateOfEmployment || undefined,
          avatar: formData.avatar === "" ? null : undefined,
        };

        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

        await axiosClient.patch(`/employees/${id}`, payload);
      }

      toast.success(t("updateSuccess"));
      navigate(-1);
    } catch (err: any) {
      console.error("Update failed", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("updateFailedGeneric");

      if (typeof message === "string" && message.includes("E11000 duplicate key error")) {
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("hrManagement")}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>{t("dashboard")}</span>
            <span>&lt;</span>
            <span>{t("hr")}</span>
            <span>&lt;</span>
            <span>{formData.name}{t("editSuffix")}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {t("personalDetails")}
          </h2>

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

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) {
                    setImageFile(f);
                    setImage(URL.createObjectURL(f));
                  }
                }}
                className="text-xs text-gray-500"
              />
            </div>
          </div>

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

          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">{t("jobDetails")}</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t("department")}</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="">{t("selectDepartment")}</option>
                {departmentsList.map((d) => (
                  <option key={d._id ?? d.id} value={d._id ?? d.id}>
                    {d.name ?? d.title ?? (d._id ?? d.id)}
                  </option>
                ))}
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
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
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
                <option value="">{t("selectManager")}</option>
                {managersList.map((m) => (
                  <option key={m._id ?? m.id} value={m._id ?? m.id}>
                    {m.name ?? m.fullName ?? (m._id ?? m.id)}
                  </option>
                ))}
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

          <div className="flex justify-start gap-3 mt-6">
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
