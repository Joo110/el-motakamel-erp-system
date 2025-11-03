import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Employee = {
  id: string;
  name: string;
  department: string;
  location: string;
  jobTitle: string;
  type: string;
  status: string;
};

const EmployeeListScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
const navigate = useNavigate();

  const [employees] = useState<Employee[]>([
    {
      id: '193382',
      name: 'Anwar Tarek Mohammed',
      department: 'Sales',
      location: 'Cairo office',
      jobTitle: 'Sales Specialist',
      type: 'Part Time',
      status: 'Active',
    },
    {
      id: '32216-1',
      name: 'Kareem Tarek Mohammed',
      department: 'Technical Support',
      location: 'Alex Branch',
      jobTitle: 'Software engineer',
      type: 'Full Time',
      status: 'Active',
    },
    {
      id: '32041-3',
      name: 'Ahmed Sayed Mohamed',
      department: 'HR',
      location: 'Capital office',
      jobTitle: 'HR Director',
      type: 'Project Based',
      status: 'Active',
    },
  ]);

  const departments = ['All Departments', 'Sales', 'Technical Support', 'HR', 'Software'];

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
              <span>HR</span>
            </div>
          </div>
          <button
          onClick={() => navigate(`/dashboard/hr/employee/new`)}
           className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium flex items-center gap-2">
            <Plus size={20} />
            Add Employee
          </button>
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
                  placeholder="Search products by name, id, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                />
              </div>

              {/* Department Select */}
              <div className="w-48 min-w-[150px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
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

          {/* Table Section */}
          <div className="p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Employees</h3>
              <span className="text-sm text-gray-500">Showing 1-10 of 247 employees</span>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Id</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Department</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Location</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Job Title</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-600">View</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="text-sm text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{emp.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{emp.department}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{emp.location}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{emp.jobTitle}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{emp.type}</td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-green-600">{emp.status}</span>
                    </td>
                    <td className="py-3 px-3">
  <div className="flex items-center gap-2">
    {/* View Button */}
    <button
      onClick={() => navigate(`/dashboard/employees/view/:id`)}
      className="text-blue-600 hover:text-blue-800 text-sm underline"
    >
      view
    </button>

    {/* Edit Button */}
    <button
      onClick={() => navigate(`/dashboard/hr/employee/edit/:id`)}
      className="text-blue-600 hover:text-blue-800"
    >
      <Edit size={16} />
    </button>

    {/* Delete Button */}
    <button
      onClick={() => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
          // هنا ممكن تضيف اللوجيك للحذف
          console.log('Deleted', emp.id);
        }
      }}
      className="text-blue-600 hover:text-blue-800"
    >
      <Trash2 size={16} />
    </button>
  </div>
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

export default EmployeeListScreen;
