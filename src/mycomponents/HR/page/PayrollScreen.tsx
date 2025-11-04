import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // << اضافه

type PayrollItem = {
  id: string;
  name: string;
  salary: string;
  overtime: string;
  bonus: string;
  deductions: string;
  total: string;
  date: string;
  status: 'Paid' | 'Unpaid';
};

const PayrollScreen: React.FC = () => {
  const navigate = useNavigate(); // << اضافه
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [payroll, setPayroll] = useState<PayrollItem[]>([
    {
      id: '193382',
      name: 'Anwar Tarek Mohammed',
      salary: '22,500 SR',
      overtime: '22,500 SR',
      bonus: '22,500 SR',
      deductions: '22,500 SR',
      total: '22,500 SR',
      date: '22,500 SR',
      status: 'Paid',
    },
    {
      id: '32216-1',
      name: 'Kareem Tarek Mohammed',
      salary: '22,500 SR',
      overtime: '22,500 SR',
      bonus: '22,500 SR',
      deductions: '22,500 SR',
      total: '22,500 SR',
      date: '22,500 SR',
      status: 'Unpaid',
    },
    {
      id: '32641-3',
      name: 'Ahmed Sayed Mohamed',
      salary: '22,500 SR',
      overtime: '22,500 SR',
      bonus: '22,500 SR',
      deductions: '22,500 SR',
      total: '22,500 SR',
      date: '22,500 SR',
      status: 'Unpaid',
    },
  ]);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const statuses = ['All','Paid','Unpaid'];
  const departments = ['All Departments','Sales','Technical Support','HR','Software'];

  const handlePaySalary = (id: string) => {
    setPayroll(payroll.map(item => item.id === id ? {...item, status: 'Paid'} : item));
  };

  const handleModify = (id: string) => {
    navigate(`/payroll/modify/${id}`); // << راح تروح لصفحة التعديل
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>Dashboard</span>
              <span>&gt;</span>
              <span>Payroll</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Search Section */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Employees Search</h2>
              <Filter size={20} className="text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              {/* Search Input */}
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employees by name, id, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                />
              </div>

              {/* Month */}
              <div className="w-44">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {months.map((month) => <option key={month} value={month}>{month}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="w-36">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              {/* Department */}
              <div className="w-48">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              {/* Buttons */}
              <button className="px-6 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-800 text-sm flex items-center gap-2">
                <Search size={16} />
                Search
              </button>
              <button className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-sm">
                Reset
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">November Payroll</h3>
              <span className="text-sm text-gray-500">Showing 1-10 of 247 employees</span>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Id</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Overtime</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Bonus</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Deductions</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                        {item.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <span className="text-sm text-gray-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.salary}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.overtime}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.bonus}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.deductions}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {item.status === 'Paid' ? (
                        <>
                          <span className="text-sm text-green-600">{item.status}</span>
                        </>
                      ) : (
                        <button
                          onClick={() => handlePaySalary(item.id)}
                          className="px-4 py-1 bg-slate-700 text-white text-sm rounded-xl hover:bg-slate-800"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => handleModify(item.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-300"
                      >
                        Modify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm bg-slate-700 text-white rounded-xl">1</button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">2</button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">3</button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollScreen;