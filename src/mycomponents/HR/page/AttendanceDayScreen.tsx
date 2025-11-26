import React, { useState, useMemo } from "react";
import { Search, Calendar, Filter, Clock, CheckCircle, XCircle } from "lucide-react";
import useAttendances from "../hooks/useAttendances";
import { useTranslation } from "react-i18next"; // إضافة استيراد useTranslation

const AttendanceDayScreen: React.FC = () => {
  const { t } = useTranslation(); // استخدام hook الترجمة
  const { getDay, loading, error } = useAttendances();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    return day;
  });

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!selectedDate) return;
    setIsSearching(true);
    setCurrentPage(1);
    try {
      const data = await getDay(selectedDate);
      setAttendanceData(data || []);
    } catch (err) {
      console.error("Error fetching day attendance", err);
      setAttendanceData([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (attendanceData || []).filter((att: any) => {
      if (!q) return true;
      const name = (att.employee?.name ?? att.employeeName ?? att.name ?? "").toString().toLowerCase();
      const id = (att.employee?._id ?? att.employeeId ?? "").toString().toLowerCase();
      const status = (att.status ?? "").toString().toLowerCase();
      return name.includes(q) || id.includes(q) || status.includes(q);
    });
  }, [attendanceData, searchTerm]);

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filtered.slice(start, start + entriesPerPage);
  }, [filtered, currentPage, entriesPerPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const formatTime = (timeStr: any) => {
    if (!timeStr) return "—";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const calculateDuration = (checkIn: any, checkOut: any) => {
    if (!checkIn || !checkOut) return "—";
    try {
      const start = new Date(checkIn).getTime();
      const end = new Date(checkOut).getTime();
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('attendance_management')}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>{t('dashboard')}</span>
              <span>&lt;</span>
              <span>{t('attendance')}</span>
              <span>&lt;</span>
              <span>{t('daily_view')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('select_date')}</h2>
              <Filter size={20} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('date_label')}</label>
                <div className="relative">
                  {/* تم تعديل موضع الأيقونة ليتناسب مع RTL */}
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('day_placeholder')}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_label')}</label>
                <div className="relative">
                  {/* تم تعديل موضع الأيقونة ليتناسب مع RTL */}
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-4 flex gap-3">
                <button
                  onClick={handleSearch}
                  disabled={!selectedDate || isSearching}
                  className="flex-1 px-6 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-800 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Search size={16} />
                  {isSearching ? t('loading_text') : t('search_button')}
                </button>
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setSearchTerm("");
                    setAttendanceData([]);
                    setCurrentPage(1);
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-sm transition-colors"
                >
                  {t('reset_button')}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t('attendance_records')} {selectedDate && `${t('day_prefix')} ${selectedDate}`}
              </h3>
              <span className="text-sm text-gray-500">
                {t('showing_prefix')} {Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries || 0)}-
                {Math.min(currentPage * entriesPerPage, totalEntries)} {t('of_suffix')} {totalEntries} {t('records_suffix')}
              </span>
            </div>

            {loading || isSearching ? (
              <div className="py-20 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-slate-400" />
                {t('loading_records_message')}
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-500">
                <XCircle className="w-12 h-12 mx-auto mb-4" />
                {t('failed_load_records_message')}
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {selectedDate ? t('no_records_for_date_message') : t('select_date_to_view_message')}
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {/* تم تعديل المحاذاة لـ RTL */}
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('employee_column')}</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('id_column')}</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('check_in_column')}</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('check_out_column')}</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('duration_column')}</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('status_column')}</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600">{t('notes_column')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((att: any) => {
                      const displayName = att.employee?.name ?? att.employeeName ?? att.name ?? t('unknown_text');
                      const empId = att.employee?._id ?? att.employeeId ?? "—";
                      const checkIn = formatTime(att.checkIn ?? att.checkInTime);
                      const checkOut = formatTime(att.checkOut ?? att.checkOutTime);
                      const duration = calculateDuration(att.checkIn ?? att.checkInTime, att.checkOut ?? att.checkOutTime);
                      const statusKey = (att.status ?? "").toLowerCase();
                      const statusText = t(`status_${statusKey}`, { defaultValue: t('unknown_text') });
                      const notes = att.notes ?? att.remarks ?? "—";

                      return (
                        <tr key={att._id ?? att.id} className="border-b hover:bg-gray-50">
                          {/* تم تعديل المحاذاة لـ RTL */}
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm text-gray-900">{displayName}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 text-right">{empId}</td>
                          <td className="py-4 px-6 text-sm text-gray-600 text-right">
                            {/* تم تعديل موضع الأيقونة لـ RTL */}
                            <div className="flex items-center gap-2 justify-end">
                              <CheckCircle size={14} className="text-green-500" />
                              {checkIn}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 text-right">
                            {checkOut !== "—" ? (
                              <div className="flex items-center gap-2 justify-end">
                                <XCircle size={14} className="text-red-500" />
                                {checkOut}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 text-right">{duration}</td>
                          <td className="py-4 px-6 text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              statusKey === "present" ? "bg-green-100 text-green-700" :
                              statusKey === "absent" ? "bg-red-100 text-red-700" :
                              statusKey === "late" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>{statusText}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate text-right" title={notes}>{notes}</td>
                        </tr>
                      );
                    })}
                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">{t('no_records_found_table')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{t('show_prefix')}</span>
                    <select 
                      value={entriesPerPage} 
                      onChange={(e) => { 
                        setEntriesPerPage(Number(e.target.value)); 
                        setCurrentPage(1); 
                      }} 
                      className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">{t('entries_suffix')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                      disabled={currentPage === 1}
                    >
                      {t('previous_button')}
                    </button>

                    {getPageNumbers().map((page, idx) => {
                      if (page === 'ellipsis') return <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>;
                      return (
                        <button 
                          key={page} 
                          onClick={() => setCurrentPage(page as number)} 
                          className={`px-4 py-2 text-sm rounded-xl transition-colors ${
                            page === currentPage 
                              ? "bg-slate-700 text-white" 
                              : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button 
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                      disabled={currentPage === totalPages}
                    >
                      {t('next_button')}
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

export default AttendanceDayScreen;