import React, { useState } from 'react';
import { useRoles } from '../../Roles/hooks/useRoles';
import { useDepartments } from '../../Department/hooks/useDepartments';
import { useEmployees } from '../../HR/hooks/useEmployees';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Edit2, Upload } from 'lucide-react';

type EmployeeFormData = {
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

const AddEmployeeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    jobTitle: '',
    nationalId: '',
    address: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    alternatePhone: '',
    department: '',
    workLocation: '',
    role: '',
    level: '',
    employmentType: '',
    manager: '',
    salary: '',
    dateOfEmployment: '',
  });

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { roles = [] } = useRoles();
  const { departments = [] } = useDepartments();
  const { createEmployee } = useEmployees();

  const fakeManagers = [
    { id: '69079a32b9644d425bffc67e', name: 'Ahmed Hassan' },
    { id: '69079a32b9644d425bffc67f', name: 'Mohamed Ali' },
    { id: '69079a32b9644d425bffc680', name: 'Ali Hassan' },
  ];

  const toDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  };

  const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  const isNumeric = (s: string) => /^\d+$/.test(s.trim());

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('❌ Image file is too large! Please upload an image under 3MB.');
      setImage(null);
      setImageFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(file);
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.jobTitle.trim()) {
      toast.error('Job Title is required');
      return;
    }
    if (!formData.nationalId.trim()) {
      toast.error('National ID is required');
      return;
    }
    if (!isNumeric(formData.nationalId.trim()) || formData.nationalId.trim().length < 6) {
      toast.error('National ID must be numeric and at least 6 digits');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!isEmail(formData.email)) {
      toast.error('Invalid email address');
      return;
    }
    if (!formData.department) {
      toast.error('Please select a Department');
      return;
    }
    if (!formData.role) {
      toast.error('Please select a Role');
      return;
    }
    if (!formData.manager) {
      toast.error('Please select a Manager');
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error('Please select Date of Birth');
      return;
    }
    if (!formData.dateOfEmployment) {
      toast.error('Please select Date of Employment');
      return;
    }
    if (formData.phone && !isNumeric(formData.phone)) {
      toast.error('Phone must contain numbers only');
      return;
    }
    if (formData.alternatePhone && !isNumeric(formData.alternatePhone)) {
      toast.error('Alternate Phone must contain numbers only');
      return;
    }
    if (formData.salary && isNaN(Number(formData.salary))) {
      toast.error('Salary must be a number');
      return;
    }
    if (formData.dateOfBirth && formData.dateOfEmployment) {
      const dob = new Date(formData.dateOfBirth);
      const empd = new Date(formData.dateOfEmployment);
      if (empd < dob) {
        toast.error('Employment date cannot be before birth date');
        return;
      }
    }

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('jobTitle', formData.jobTitle);
      form.append('nationalId', formData.nationalId);
      form.append('address', formData.address);
      form.append('birthDate', toDDMMYYYY(formData.dateOfBirth));
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('alternativePhone', formData.alternatePhone);
      form.append('department', formData.department || '');
      form.append('workLocation', formData.workLocation);
      form.append('role', formData.role || '');
      form.append('experienceLevel', formData.level);
      form.append('employmentType', formData.employmentType);
      form.append('manager', formData.manager || '');
      form.append('salary', formData.salary ? String(Number(formData.salary)) : '');
      form.append('employmentDate', toDDMMYYYY(formData.dateOfEmployment));

      if (imageFile) {
        form.append('avatar', imageFile);
      }

      const created = await createEmployee(form as unknown as any);

      if (created) {
        toast.success('Employee created successfully');
        navigate('/dashboard/hr/employees');
      } else {
        toast.error('Failed to create employee');
      }
    } catch (err: any) {
      console.error('Create employee error', err);

      // ✅ التعامل مع أخطاء التكرار من MongoDB
      const message =
        err?.message ||
        err?.err?.message ||
        err?.response?.data?.message ||
        err?.err?.errorResponse?.errmsg ||
        '';

      if (message.includes('E11000 duplicate key error')) {
        if (message.includes('email')) {
          toast.error('❌ This email is already registered!');
        } else if (message.includes('phone')) {
          toast.error('❌ This phone number is already registered!');
        } else if (message.includes('alternativePhone')) {
          toast.error('❌ This alternative phone is already registered!');
        } else {
          toast.error('❌ Duplicate field value detected.');
        }
      } else {
        toast.error(message || 'Error creating employee');
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>HR</span>
            <span>&gt;</span>
            <span>Add</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Details</h2>

          {/* Personal Details Grid */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">National Id</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            <div>
              {/* Image Preview */}
          <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-2 text-xs overflow-hidden border border-gray-300">
  {image ? (
    <img
      src={image}
      alt="Employee avatar preview"
      className="w-full h-full object-contain object-center bg-gray-100"
    />
  ) : (
    <span className="text-gray-400 text-sm">Image preview</span>
  )}
</div>

<div className="flex gap-2">
  <label className="flex-1 cursor-pointer">
    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded text-xs hover:bg-gray-800 transition-all">
      {image ? <Edit2 size={14} /> : <Upload size={14} />}
      <span>{image ? 'Edit Image' : 'Upload Image'}</span>
    </div>
    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
  </label>

  {image && (
    <button 
      onClick={() => { setImage(null); setImageFile(null); }}
      className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
    >
      Remove
    </button>
  )}
</div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Alternate Phone</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Job Details Section */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">Job Details</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                {(departments || []).map((d: any) => (
                  <option key={d._id ?? d.id} value={d._id ?? d.id}>
                    {d.name ?? d.title ?? 'Unnamed'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Work Location</label>
              <select
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                <option value="Cairo office">Cairo office</option>
                <option value="Alex Branch">Alex Branch</option>
                <option value="Capital office">Capital office</option>
                <option value="Mansoura office">Mansoura office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                {(roles || []).map((r: any) => (
                  <option key={r._id ?? r.id} value={r._id ?? r.id}>
                    {r.role ?? r.name ?? 'Unnamed Role'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                {fakeManagers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Level of Experience</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Director">Director</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="project-based">Project Based</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Employment</label>
              <input
                type="date"
                value={formData.dateOfEmployment}
                onChange={(e) => setFormData({ ...formData, dateOfEmployment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
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

export default AddEmployeeScreen;