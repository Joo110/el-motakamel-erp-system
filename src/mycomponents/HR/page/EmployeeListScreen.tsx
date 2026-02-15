import React, { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useEmployees from "@/mycomponents/HR/hooks/useEmployees";
import useDepartments from "../../Department/hooks/useDepartments";
import { useTranslation } from "react-i18next"; 

const EmployeeListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 

  // detect current language direction / arabic
  const lang = i18n.language || "en";
  const isArabic = (lang || "").toLowerCase().startsWith("ar") || i18n.dir?.(lang) === "rtl";
  const alignClass = isArabic ? "text-right" : "text-left";
  const iconPosClass = isArabic ? "right-4" : "left-4";
  const inputPaddingClass = isArabic ? "pr-10 pl-4" : "pl-10 pr-4";

  const { employees, loading, error, refresh, deleteEmployee } = useEmployees();
  const { departments, loading: depsLoading } = useDepartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(""); // empty = all
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // build map id -> name from departments array
  const deptMap = useMemo(() => {
    const map = new Map<string, string>();
    (departments || []).forEach((d: any) => {
      const id = (d._id ?? d.id ?? "").toString();
      const name = (d.name ?? d.title ?? "").toString();
      if (id) map.set(id, name || id);
    });
    return map;
  }, [departments]);

  // helper to safely get department name from employee.department which may be id or object
  const getDeptName = (deptField: any) => {
    if (!deptField) return t("notAvailable");
    // if it's a string id
    if (typeof deptField === "string") {
      const key = deptField.toString();
      return deptMap.get(key) ?? key;
    }
    // if it's an object like { _id, name }
    if (typeof deptField === "object") {
      // sometimes object contains nested department object
      const maybeId = (deptField._id ?? deptField.id ?? "")?.toString();
      const maybeName = (deptField.name ?? deptField.title ?? deptField.label ?? "")?.toString();
      if (maybeName) return maybeName;
      if (maybeId && deptMap.has(maybeId)) return deptMap.get(maybeId) as string;
      if (maybeId) return maybeId;
      return t("notAvailable");
    }
    // fallback
    return String(deptField);
  };

  // departments options (value = id, label = name)
  const departmentOptions = useMemo(() => {
    const opts = (departments || []).map((d: any) => ({
      id: (d._id ?? d.id ?? "").toString(),
      name: d.name ?? d.title ?? (d._id ?? d.id),
    }));
    return opts;
  }, [departments]);

  // filter employees locally by search term and department
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (employees || []).filter((e: any) => {
      // department filter: compare id (if selectedDepartment is set)
      if (selectedDepartment && selectedDepartment !== "" && ( (typeof e.department === "string" ? e.department : (e.department?._id ?? "")) !== selectedDepartment )) {
        return false;
      }
      if (!q) return true;
      // search by name, id or department name
      const id = (e.id ?? e._id ?? "").toString().toLowerCase();
      const name = (e.name ?? e.fullName ?? "").toString().toLowerCase();
      const deptName = (getDeptName(e.department) ?? "").toString().toLowerCase();
      return id.includes(q) || name.includes(q) || deptName.includes(q);
    });
  }, [employees, searchTerm, selectedDepartment, deptMap]);

  // pagination
  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filtered.slice(start, start + entriesPerPage);
  }, [filtered, currentPage, entriesPerPage]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm(t("deleteConfirm")); 
    if (!ok) return;
    try {
      await deleteEmployee(id);
      await refresh();
      if ((currentPage - 1) * entriesPerPage >= Math.max(0, totalEntries - 1) && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/hr/employee/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/dashboard/hr/employee/view/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={isArabic ? "rtl" : "ltr"}> 
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("hrManagement")}</h1>
            <div className={`flex items-center gap-2 text-sm text-gray-500 mt-1 ${isArabic ? "flex-row-reverse" : ""}`}>
              <span>{t("dashboard")}</span>
              <span>&lt;</span> {/* عكس اتجاه السهم لدعم RTL */}
              <span>{t("hr")}</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/dashboard/hr/employee/new`)}
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium flex items-center gap-2"
          >
            <Plus size={20} />
            {t("addEmployee")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Search Section */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t("employeesSearch")}</h2>
              <Filter size={20} className="text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              {/* Search Input */}
              <div className="flex-1 min-w-[250px] relative">
                <Search className={`absolute ${iconPosClass} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} /> 
                <input
                  type="text"
                  placeholder={t("search_Placeholder")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full ${inputPaddingClass} py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm`}
                />
              </div>
              {/* Department Select */}
              <div className="w-48 min-w-[150px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  <option value="">{t("all_Departments")}</option>
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <button
                onClick={() => {
                  setCurrentPage(1);
                }}
                className="px-6 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-800 text-sm flex items-center gap-2"
              >
                <Search size={16} />
                {t("search")}
              </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("");
                  setCurrentPage(1);
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-sm"
              >
                {t("reset")}
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t("employeesTitle")}</h3>
              <span className="text-sm text-gray-500">
                {t("showing_Employees", {
                  start: Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries || 0),
                  end: Math.min(currentPage * entriesPerPage, totalEntries),
                  total: totalEntries,
                })}
              </span>
            </div>

            {loading || depsLoading ? (
              <div className="py-20 text-center text-gray-500">{t("loadingEmployees")}</div>
            ) : error ? (
              <div className="py-20 text-center text-red-500">{t("loadError")}</div>
            ) : (
              <>
                <table className={`w-full ${isArabic ? "text-right" : "text-left"}`}>
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("name")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("id")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("department")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("location")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("jobTitle")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("type")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("status")}</th>
                      <th className={`${alignClass} py-4 px-6 text-xs font-medium text-gray-600`}>{t("view")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((emp: any) => {
                      const empId = emp.id ?? emp._id ?? "";
                      const displayName = emp.name ?? emp.fullName ?? t("notAvailable");
                      const departmentName = getDeptName(emp.department);
                      const location = emp.workLocation ?? emp.location ?? t("notAvailable");
                      const type = emp.employmentType ?? emp.type ?? t("notAvailable");
                      const jobTitle = emp.jobTitle ?? t("notAvailable");
                      const status = emp.status ?? (emp.active ? t("activeStatus") : t("notAvailable"));

                      return (
                        <tr key={empId} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className={`flex items-center gap-3 ${isArabic ? "flex-row-reverse" : ""}`}>
                              {emp.avatar || emp.image || emp.profilePic ? (
                                <img
                                  src={emp.avatar || emp.image || emp.profilePic}
                                  alt={displayName}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                                  {displayName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
                              <span
                                className="text-sm text-gray-900 block"
                                style={{ textAlign: isArabic ? "right" : "left" }}
                              >
                                {displayName}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">{empId}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{departmentName}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{location}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{jobTitle}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{type}</td>
                          <td className="py-4 px-6">
                            <span className={`text-sm ${status === t("activeStatus") ? "text-green-600" : "text-gray-600"}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {/* View Button */}
                              <button
                                onClick={() => handleView(empId)}
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                {t("viewAction")}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEdit(empId)}
                                className="text-blue-600 hover:text-blue-800"
                                title={t("editAction")}
                              >
                                <Edit size={16} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(empId)}
                                className="text-blue-600 hover:text-blue-800"
                                title={t("deleteAction")}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          {t("noEmployeesFound")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{t("show")}</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">{t("entries")}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                      disabled={currentPage === 1}
                    >
                      {t("previous")}
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      // only show a few pages for brevity
                      if (totalPages > 7) {
                        if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 text-sm rounded-xl ${page === currentPage ? "bg-slate-700 text-white" : "bg-white border border-gray-300"}`}
                            >
                              {page}
                            </button>
                          );
                        }
                        if (page === 2 && currentPage > 3) {
                          return <span key={page} className="px-3">...</span>;
                        }
                        if (page === totalPages - 1 && currentPage < totalPages - 2) {
                          return <span key={page} className="px-3">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 text-sm rounded-xl ${page === currentPage ? "bg-slate-700 text-white" : "bg-white border border-gray-300"}`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                      disabled={currentPage === totalPages}
                    >
                      {t("next")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListScreen;