import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

type Employee = {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  status: string;
  monthlyAttendance?: string[];
};

const AttendanceScreen: React.FC = () => {
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7 - 10 - 2025');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');

  // pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const employees: Employee[] = [
    {
      id: '193382',
      name: 'Anwar Tarek Anwar',
      checkIn: '9:16 AM',
      checkOut: '5:01 PM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '322141',
      name: 'Kareem Tarek Mohammed',
      checkIn: '9:20 AM',
      checkOut: '4:20 PM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '324413',
      name: 'Ahmed Sayed Mohamed',
      checkIn: '10:09 AM',
      checkOut: '5:20 AM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '322141-2',
      name: 'Kareem Tarek Mohammed 2',
      checkIn: '10:09 AM',
      checkOut: '5:20 AM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '322141-3',
      name: 'Kareem Tarek Mohammed 3',
      checkIn: '10:09 AM',
      checkOut: '5:20 AM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '322141-4',
      name: 'Kareem Tarek Mohammed 4',
      checkIn: '10:09 AM',
      checkOut: '5:20 AM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '322141-5',
      name: 'Kareem Tarek Mohammed 5',
      checkIn: '10:09 AM',
      checkOut: '5:20 AM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
    {
      id: '322141-6',
      name: 'Kareem Tarek Mohammed 6',
      checkIn: '10:09 AM',
      checkOut: '5:20 AM',
      status: 'Present',
      monthlyAttendance: Array(31).fill('P'),
    },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // filtered list based on search / status / department
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return employees.filter((e) => {
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
  }, [employees, searchTerm, selectedStatus, selectedDepartment]);

  // pagination calculations
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
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm">
              Reset
            </button>
          </div>
        </div>

        {/* Table Section */}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Id</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Chick in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Chick out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => (
                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <span className="text-sm text-gray-900">{emp.name}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{emp.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{emp.checkIn}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{emp.checkOut}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{emp.status}</td>
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 sticky left-0 bg-white">
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
                      <td className="px-3 py-3 sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-gray-900 whitespace-nowrap">{emp.name}</span>
                        </div>
                      </td>
                      {emp.monthlyAttendance?.map((status, dayIdx) => (
                        <td key={dayIdx} className="px-2 py-3 text-center text-xs text-gray-500">
                          {status}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-6">
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
                className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-full ${
                    currentPage === pageNum ? 'bg-slate-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScreen;
