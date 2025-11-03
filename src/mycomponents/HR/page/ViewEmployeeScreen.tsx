import React, { useState } from 'react';
import { X } from 'lucide-react';

type Employee = {
  name: string;
  jobTitle: string;
  nationalId: string;
  address: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  alternatePhone: string;
  department: string;
  workLocation: string;
  role: string;
  level: string;
  employmentType: string;
  manager: string;
  salary: string;
  dateOfEmployment: string;
};

const ViewEmployeeScreen: React.FC = () => {
  const [employee] = useState<Employee>({
    name: 'Anwar Tarek Mohammed Youssef',
    jobTitle: 'Back-End Developer',
    nationalId: '30108577305730',
    address: 'Mdigromt, Abo Natiom -Bosts Street',
    dateOfBirth: '19-3-2025',
    email: 'antar1998@gmail.com',
    phone: '0120831246453',
    alternatePhone: '01198742909BL',
    department: 'Software',
    workLocation: 'Mansoura office',
    role: 'Employee',
    level: 'Senior',
    employmentType: 'Full Time',
    manager: 'Aali Hassan',
    salary: '78,000 SR',
    dateOfEmployment: '19/10/2025',
  });

  const handleEdit = () => {
    console.log('Edit employee');
  };

  const handleClose = () => {
    console.log('Close view');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">HR Management</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>Dashboard</span>
                <span>&gt;</span>
                <span>HR</span>
                <span>&gt;</span>
                <span>Anwar Tarek M.Yousef</span>
                <span>&gt;</span>
                <span>Edit</span>
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
          <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Details</h2>
          
          {/* Personal Details Grid - Read Only */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Employee Name</label>
                <div className="text-sm text-gray-900 py-2">{employee.name}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Job Title</label>
                <div className="text-sm text-gray-900 py-2">{employee.jobTitle}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">National Id</label>
                <div className="text-sm text-gray-900 py-2">{employee.nationalId}</div>
              </div>
            </div>

            {/* Image Display Section */}
            <div>
              <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-2 text-xs">
                Image preview
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs">
                  Edit Image
                </button>
                <button className="flex-1 px-3 py-1.5 bg-gray-700 text-white rounded text-xs">
                  Upload Image
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information - Read Only */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
              <div className="text-sm text-gray-900 py-2">{employee.address}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
              <div className="text-sm text-gray-900 py-2">{employee.dateOfBirth}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <div className="text-sm text-gray-900 py-2">{employee.email}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <div className="text-sm text-gray-900 py-2">{employee.phone}</div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Alternate Phone</label>
              <div className="text-sm text-gray-900 py-2">{employee.alternatePhone}</div>
            </div>
          </div>

          {/* Job Details Section - Read Only */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">Job Details</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
              <div className="text-sm text-gray-900 py-2">{employee.department}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Work Location</label>
              <div className="text-sm text-gray-900 py-2">{employee.workLocation}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
              <div className="text-sm text-gray-900 py-2">{employee.role}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Level of Experience</label>
              <div className="text-sm text-gray-900 py-2">{employee.level}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Employment Type</label>
              <div className="text-sm text-gray-900 py-2">{employee.employmentType}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Manager</label>
              <div className="text-sm text-gray-900 py-2">{employee.manager}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Salary</label>
              <div className="text-sm text-gray-900 py-2">{employee.salary}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of Employment</label>
              <div className="text-sm text-gray-900 py-2">{employee.dateOfEmployment}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={handleClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleEdit}
              className="px-5 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeScreen;