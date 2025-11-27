import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, LogIn, LogOut, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import useAttendances from '../hooks/useAttendances';
import type { Attendance } from '../services/attendancesService';
import { useTranslation } from 'react-i18next';

const apiStatusKeysMap = {
  'Present': 'present_status',
  'Absent': 'absent_status',
  'Late': 'late_status',
};

type Employee = {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  status: string;
  avatar?: string;
  monthlyAttendance?: string[];
  attendanceId?: string;
};

const AttendanceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { getToday, getMonth, checkIn: apiCheckIn, checkOut: apiCheckOut } = useAttendances();
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7 - 10 - 2025');

  const [selectedStatus, setSelectedStatus] = useState(t('all_status'));
  const [selectedDepartment, setSelectedDepartment] = useState(t('all_departments'));

  const [showAddModal, setShowAddModal] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyEmployees, setDailyEmployees] = useState<Employee[]>([]);
  const [monthlyEmployees, setMonthlyEmployees] = useState<Employee[]>([]);

  // determine language directionality and whether current language is Arabic
  const lang = (i18n.language || 'en').toLowerCase();
  const isArabic = lang.startsWith('ar') || (typeof i18n.dir === 'function' && i18n.dir(lang) === 'rtl');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const formatTimeOrDash = (iso?: string | null) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const mapDailyAttendancesToEmployees = useCallback((atts: Attendance[]): Employee[] => {
    return atts.map(a => {
      const empObj: any = (a as any).employee ?? (a as any).user ?? null;
      const empId = empObj?._id ?? (a as any).userId ?? String(a._id ?? Math.random());
      const name = empObj?.name ?? empObj?.fullName ?? t('status_unknown');
      const avatar = empObj?.avatar ?? undefined;

      const statusKey = a.status || 'Absent';
      const translationKey = apiStatusKeysMap[statusKey as keyof typeof apiStatusKeysMap] || 'absent_status';
      const translatedStatus = t(translationKey as any);

      return {
        id: empId,
        name,
        avatar,
        checkIn: a.checkIn ? formatTimeOrDash(a.checkIn) : '-',
        checkOut: a.checkOut ? formatTimeOrDash(a.checkOut) : '-',
        status: translatedStatus,
        monthlyAttendance: Array(31).fill('-'),
        attendanceId: String(a._id ?? ''),
      };
    });
  }, [t]);

  const mapMonthAttendancesToEmployees = useCallback((atts: any[], daysCount = 31): Employee[] => {
    return atts.map(a => {
      const empObj: any = (a as any).employee ?? (a as any).user ?? null;
      const empId = empObj?._id ?? (a as any).userId ?? String(Math.random());
      const name = empObj?.name ?? empObj?.fullName ?? (a as any).employee ?? t('status_unknown');
      const monthlyAttendance = Array(daysCount).fill('-');

      (a as any).attendances?.forEach((att: any) => {
        const date = att.date ?? att.createdAt ?? null;
        if (!date) return;
        const d = new Date(date);
        const dayNum = d.getDate();
        if (dayNum >= 1 && dayNum <= daysCount) {
          const statusLower = (att.status ?? '').toLowerCase();
          if (statusLower === 'present' || statusLower.startsWith('p')) {
            monthlyAttendance[dayNum - 1] = 'P';
          } else if (statusLower === 'absent' || statusLower.startsWith('a')) {
            monthlyAttendance[dayNum - 1] = 'A';
          } else {
            monthlyAttendance[dayNum - 1] = 'A';
          }
        }
      });

      return {
        id: empId,
        name,
        checkIn: '-',
        checkOut: '-',
        status: '-',
        monthlyAttendance,
        attendanceId: undefined
      };
    });
  }, [t]);

  const loadDailyData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const list = await getToday();
      if (Array.isArray(list) && list.length > 0) {
        const mapped = mapDailyAttendancesToEmployees(list as Attendance[]);
        setDailyEmployees(mapped);
      } else {
        setDailyEmployees([]);
      }
    } catch (err) {
      console.error('Failed to load daily data', err);
      setDailyEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToday, isLoading, mapDailyAttendancesToEmployees]);

  const loadMonthlyData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const list = await getMonth({ year, month });
      if (Array.isArray(list) && list.length > 0) {
        const mapped = mapMonthAttendancesToEmployees(list as any[], days.length);
        setMonthlyEmployees(mapped);
      } else {
        setMonthlyEmployees([]);
      }
    } catch (err) {
      console.error('Failed to load monthly data', err);
      setMonthlyEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [getMonth, isLoading, days.length, mapMonthAttendancesToEmployees]);

  useEffect(() => {
    if (view === 'daily' && dailyEmployees.length === 0) {
      loadDailyData();
    } else if (view === 'monthly' && monthlyEmployees.length === 0) {
      loadMonthlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const source = view === 'daily' ? dailyEmployees : monthlyEmployees;

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return source.filter((e) => {
      if (selectedStatus !== t('all_status') && e.status !== selectedStatus) return false;
      if (!q) return true;
      return (
        (e.name ?? '').toLowerCase().includes(q) ||
        (e.id ?? '').toLowerCase().includes(q)
      );
    });
  }, [source, searchTerm, selectedStatus, t]);

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedDepartment, entriesPerPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filtered.slice(start, start + entriesPerPage);
  }, [filtered, currentPage, entriesPerPage]);

  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  const getPageNumbers = () => {
    if (totalPages === 0) return [];
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handleCheckIn = async (idParam: string) => {
    if (!idParam || isLoading) {
      console.error('No attendance id provided for check-in');
      return;
    }
    setIsLoading(true);
    try {
      await apiCheckIn(idParam);
      await loadDailyData();
    } catch (err) {
      console.error("Check-in failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async (idParam: string) => {
    if (!idParam || isLoading) {
      console.error('No attendance id provided for check-out');
      return;
    }
    setIsLoading(true);
    try {
      await apiCheckOut(idParam);
      await loadDailyData();
    } catch (err) {
      console.error("Check-out failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus(t('all_status'));
    setSelectedDepartment(t('all_departments'));
    setDateRange('7 - 10 - 2025');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('hr_management')}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t('dashboard')}</span>
          <span style={{ transform: 'scaleX(-1)' }}>&gt;</span>
          <span>{t('attendance')}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('daily')}
          disabled={isLoading}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
            view === 'daily'
              ? 'bg-slate-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('daily_view')}
        </button>
        <button
          onClick={() => setView('monthly')}
          disabled={isLoading}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
            view === 'monthly'
              ? 'bg-slate-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('monthly_view')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">{t('employees_search')}</h2>
            <button className="text-gray-400">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm text-gray-600"
              />
            </div>

            <div className="w-48">
              <label className="block text-xs text-gray-600 mb-1.5">{t('date_label')}</label>
              <div className="relative">
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="w-32">
              <label className="block text-xs text-gray-600 mb-1.5">{t('status_label')}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option>{t('all_status')}</option>
                <option>{t('present_status')}</option>
                <option>{t('absent_status')}</option>
                <option>{t('late_status')}</option>
              </select>
            </div>

            <div className="w-44">
              <label className="block text-xs text-gray-600 mb-1.5">{t('department_label')}</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option>{t('all_departments')}</option>
                <option>{t('sales_department')}</option>
                <option>{t('hr_department')}</option>
                <option>{t('it_department')}</option>
              </select>
            </div>

            <button className="px-6 py-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 text-sm flex items-center gap-2">
              <Search size={16} />
              {t('search_button')}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm"
            >
              {t('reset_button')}
            </button>
            <button
              onClick={() => navigate("/dashboard/hr/AttendanceDay")}
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm flex items-center gap-2"
            >
              {t('special_day_button')}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              + {t('add_attendance_button')}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">{t('attendance')}</h3>
            <span className="text-xs text-gray-500">
              {t('', { startEntry, endEntry, totalEntries })}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
          ) : view === 'daily' ? (
            <div key="daily" className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">{t('table_header_name')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">{t('table_header_check_in')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">{t('table_header_check_out')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">{t('table_header_status')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">{t('table_header_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => (
                    <tr key={`daily-${emp.id}`} className="border-b hover:bg-gray-50 transition-colors">
                      <td
                        className={`px-4 py-4 flex items-center gap-3 ${isArabic ? 'justify-end' : 'justify-start'}`}
                      >
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        )}
                        <span
                          className="text-sm text-gray-900 font-medium"
                          style={{ textAlign: isArabic ? 'right' : 'left' }}
                        >
                          {emp.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Clock size={14} className="text-green-600" />
                          <span className={`text-sm ${emp.checkIn === '-' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                            {emp.checkIn}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Clock size={14} className="text-red-600" />
                          <span className={`text-sm ${emp.checkOut === '-' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                            {emp.checkOut}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          emp.status === t('present_status')
                            ? 'bg-green-100 text-green-700'
                            : emp.status === t('absent_status')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCheckIn(emp.attendanceId ?? emp.id)}
                            disabled={emp.checkIn !== '-' || isLoading}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              emp.checkIn === '-' && !isLoading
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              emp.checkIn === '-'
                                ? t('click_to_check_in_title')
                                : t('already_checked_in_title')
                            }
                          >
                            <LogIn size={14} />
                            {t('check_in_button')}
                          </button>
                          <button
                            onClick={() => handleCheckOut(emp.attendanceId ?? emp.id)}
                            disabled={emp.checkIn === '-' || emp.checkOut !== '-' || isLoading}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              emp.checkIn !== '-' && emp.checkOut === '-' && !isLoading
                                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              emp.checkIn === '-'
                                ? t('must_check_in_first_title')
                                : emp.checkOut !== '-'
                                ? t('already_checked_out_title')
                                : t('click_to_check_out_title')
                            }
                          >
                            <LogOut size={14} />
                            {t('check_out_button')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div key="monthly" className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 sticky right-0 bg-white z-10">
                      {t('table_header_name')}
                    </th>
                    {days.map((day) => (
                      <th key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-600 min-w-[28px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => (
                    <tr key={`monthly-${emp.id}`} className="border-b hover:bg-gray-50">
                      <td className={`px-3 py-3 sticky right-0 bg-white z-10`}>
                        <div className={`flex items-center gap-2 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                            {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="text-xs text-gray-900 whitespace-nowrap font-medium" style={{ textAlign: isArabic ? 'right' : 'left' }}>{emp.name}</span>
                        </div>
                      </td>
                      {emp.monthlyAttendance?.map((status, dayIdx) => (
                        <td key={dayIdx} className="px-2 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                            status === 'P' ? 'bg-green-100 text-green-700' :
                            status === 'A' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {status}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{t('show_label')}</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span className="text-sm text-gray-700">{t('entries_label')}</span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('previous_button')}
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-slate-700 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('next_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">{t('add_new_attendance_title')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* form fields */}
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3 sticky bottom-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
              >
                {t('cancel_button')}
              </button>
              <button
                onClick={() => {
                  alert(t('attendance_added_success_alert'));
                  setShowAddModal(false);
                }}
                className="flex-1 px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium"
              >
                {t('add_attendance_button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScreen;
