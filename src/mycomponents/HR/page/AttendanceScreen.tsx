import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Clock, LogIn, LogOut, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
// ⚠️ غيّر المسار إلى مكان الهُوك الفعلي عندك:
import useAttendances from '../hooks/useAttendances';
import type { Attendance } from '../services/attendancesService';

type Employee = {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  status: string;
  avatar?: string; // ← جديد
  monthlyAttendance?: string[];
  attendanceId?: string;
};


const AttendanceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { getToday, getMonth, checkIn: apiCheckIn, checkOut: apiCheckOut } = useAttendances();
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7 - 10 - 2025');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // اضبط الافتراض إلى مصفوفة فارغة — هتتعَبّي لما يرجع السيرفر
  const [dailyEmployees, setDailyEmployees] = useState<Employee[]>([]);
  const [monthlyEmployees, setMonthlyEmployees] = useState<Employee[]>([]);

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

const mapDailyAttendancesToEmployees = (atts: Attendance[]): Employee[] => {
  return atts.map(a => {
    const empObj: any = (a as any).employee ?? (a as any).user ?? null;

    const empId = empObj?._id ?? (a as any).userId ?? String(a._id ?? Math.random());
    const name = empObj?.name ?? empObj?.fullName ?? 'Unknown';
    const avatar = empObj?.avatar ?? undefined; // ← نضيف الحقل هنا

    return {
      id: empId,
      name,
      avatar,        // ← احفظ رابط الصورة
      checkIn: a.checkIn ? formatTimeOrDash(a.checkIn) : '-',
      checkOut: a.checkOut ? formatTimeOrDash(a.checkOut) : '-',
      status: a.status ?? 'Absent',
      monthlyAttendance: Array(31).fill('-'),
      attendanceId: String(a._id ?? ''),
    };
  });
};

  const mapMonthAttendancesToEmployees = (atts: any[], daysCount = 31): Employee[] => {
    // monthly endpoint might return grouped shape (employee + attendances)
    // we will try to keep attendanceId undefined here (monthly not used for check-in/out)
    return atts.map(a => {
      const empObj: any = (a as any).employee ?? (a as any).user ?? null;
      const empId = empObj?._id ?? (a as any).userId ?? String(Math.random());
      const name = empObj?.name ?? empObj?.fullName ?? (a as any).employee ?? 'Unknown';
      const monthlyAttendance = Array(daysCount).fill('-');
      // if endpoint returns attendances list inside `a.attendances`, map them
      (a as any).attendances?.forEach((att: any) => {
        const date = att.date ?? att.createdAt ?? null;
        if (!date) return;
        const d = new Date(date);
        const dayNum = d.getDate();
        if (dayNum >= 1 && dayNum <= daysCount) {
          monthlyAttendance[dayNum - 1] = (att.status ?? '').toLowerCase().startsWith('p') ? 'P' : 'A';
        }
      });
      return { id: empId, name, checkIn: '-', checkOut: '-', status: '-', monthlyAttendance, attendanceId: undefined };
    });
  };


  // ====== fetch with debug logs ======
  useEffect(() => {
    console.log('Daily Employees:', dailyEmployees.length);
    console.log('Monthly Employees:', monthlyEmployees.length);

    (async () => {
      try {
        const list = await getToday();
        console.log('getToday result:', list);
        if (Array.isArray(list) && list.length > 0) {
          const mapped = mapDailyAttendancesToEmployees(list as Attendance[]);
          console.log('mapped daily employees:', mapped);
          setDailyEmployees(mapped);
        } else {
          console.log('no today attendances returned, keeping empty list');
          setDailyEmployees([]);
        }
      } catch (err) {
        console.error('failed to load today attendances', err);
        setDailyEmployees([]);
      }
    })();

    (async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const list = await getMonth({ year, month });
        console.log('getMonth result:', list);
        if (Array.isArray(list) && list.length > 0) {
          const mapped = mapMonthAttendancesToEmployees(list as any[], days.length);
          console.log('mapped monthly employees:', mapped);
          setMonthlyEmployees(mapped);
        } else {
          setMonthlyEmployees([]);
        }
      } catch (err) {
        console.error('failed to load month attendances', err);
        setMonthlyEmployees([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== source = اللي هنطبّق عليه الفلاتر والصفحات ======
  const source = view === 'daily' ? dailyEmployees : monthlyEmployees;

  // filtered list based on search / status / department (معدل لاستخدام source)
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return source.filter((e) => {
      if (selectedStatus !== 'All' && e.status !== selectedStatus) return false;
      if (selectedDepartment !== 'All Departments') {
        // demo data doesn't have department, so skip filter in that case
      }
      if (!q) return true;
      return (
        (e.name ?? '').toLowerCase().includes(q) ||
        (e.id ?? '').toLowerCase().includes(q)
      );
    });
  }, [source, searchTerm, selectedStatus, selectedDepartment]);

  // pagination calculations (كما في كودك لكن على filtered)
  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // reset page when filters/search change
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

  // تحديثات CheckIn / CheckOut: نحدّث المصفوفة المناسبة (daily + monthly كاحتياط)
  const handleCheckIn = async (idParam: string) => {
    // idParam should be the attendanceId (document id). If it's empty we bail out.
    if (!idParam) {
      console.error('No attendance id provided for check-in');
      return;
    }
    console.log('Checking in attendance ID:', idParam);
    try {
      await apiCheckIn(idParam);
      // refresh today's list after successful check-in
      const list = await getToday();
      setDailyEmployees(mapDailyAttendancesToEmployees(list));
    } catch (err) {
      console.error("Check-in failed", err);
    }
  };

  const handleCheckOut = async (idParam: string) => {
    if (!idParam) {
      console.error('No attendance id provided for check-out');
      return;
    }
    console.log('Checking out attendance ID:', idParam);
    try {
      await apiCheckOut(idParam);
      const list = await getToday();
      setDailyEmployees(mapDailyAttendancesToEmployees(list));
    } catch (err) {
      console.error("Check-out failed", err);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedDepartment('All Departments');
    setDateRange('7 - 10 - 2025');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">HR Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Attendance</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('daily')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
            view === 'daily'
              ? 'bg-slate-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
            view === 'monthly'
              ? 'bg-slate-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Search Section */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">Employees Search</h2>
            <button className="text-gray-400">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex items-end gap-4 flex-wrap">
            {/* Search Input */}
            <div className="flex-1 min-w-[220px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employee by name, id, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm text-gray-600"
              />
            </div>

            {/* Date */}
            <div className="w-48">
              <label className="block text-xs text-gray-600 mb-1.5">Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="w-32">
              <label className="block text-xs text-gray-600 mb-1.5">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option>All</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
              </select>
            </div>

            {/* Department */}
            <div className="w-44">
              <label className="block text-xs text-gray-600 mb-1.5">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option>All Departments</option>
                <option>Sales</option>
                <option>HR</option>
                <option>IT</option>
              </select>
            </div>

            {/* Buttons */}
            <button className="px-6 py-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 text-sm flex items-center gap-2">
              <Search size={16} />
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm"
            >
              Reset
            </button>
            <button
              onClick={() => navigate("/dashboard/hr/AttendanceDay")}
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm flex items-center gap-2"
            >
              Add Attendance
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Attendance</h3>
            <span className="text-xs text-gray-500">
              Showing {startEntry}-{endEntry} of {totalEntries} employees
            </span>
          </div>

          {view === 'daily' ? (
            /* Daily View Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => (
                    <tr key={emp.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 flex items-center gap-3">
  {emp.avatar ? (
    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
  ) : (
    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
      {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
    </div>
  )}
  <span className="text-sm text-gray-900 font-medium">{emp.name}</span>
</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-green-600" />
                          <span className={`text-sm ${emp.checkIn === '-' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                            {emp.checkIn}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-red-600" />
                          <span className={`text-sm ${emp.checkOut === '-' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                            {emp.checkOut}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          emp.status === 'Present' 
                            ? 'bg-green-100 text-green-700' 
                            : emp.status === 'Absent'
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
                            disabled={emp.checkIn !== '-'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              emp.checkIn === '-'
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={emp.checkIn === '-' ? 'Click to check in' : 'Already checked in'}
                          >
                            <LogIn size={14} />
                            Check In
                          </button>
                          <button
                            onClick={() => handleCheckOut(emp.attendanceId ?? emp.id)}
                            disabled={emp.checkIn === '-' || emp.checkOut !== '-'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              emp.checkIn !== '-' && emp.checkOut === '-'
                                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              emp.checkIn === '-' 
                                ? 'Must check in first' 
                                : emp.checkOut !== '-' 
                                ? 'Already checked out' 
                                : 'Click to check out'
                            }
                          >
                            <LogOut size={14} />
                            Check Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Monthly View Table */
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 sticky left-0 bg-white z-10">
                      Name
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
                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-3 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                            {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="text-xs text-gray-900 whitespace-nowrap font-medium">{emp.name}</span>
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

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                }}
                className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
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
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Attendance</h2>
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
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Attendance added successfully!');
                  setShowAddModal(false);
                }}
                className="flex-1 px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium"
              >
                Add Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScreen;
