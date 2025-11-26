import React, { useState } from 'react';
import { useRoles } from '../../Roles/hooks/useRoles';
import { useDepartments } from '../../Department/hooks/useDepartments';
import { useEmployees } from '../../HR/hooks/useEmployees';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Edit2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // تم إضافة الاستيراد

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
  const { t } = useTranslation(); // تم استخدام الـ hook
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
      toast.error(t('validation_image_too_large')); // استخدام الترجمة
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
      toast.error(t('validation_name_required')); // استخدام الترجمة
      return;
    }
    if (!formData.jobTitle.trim()) {
      toast.error(t('validation_job_title_required')); // استخدام الترجمة
      return;
    }
    if (!formData.nationalId.trim()) {
      toast.error(t('validation_national_id_required')); // استخدام الترجمة
      return;
    }
    if (!isNumeric(formData.nationalId.trim()) || formData.nationalId.trim().length < 6) {
      toast.error(t('validation_national_id_invalid')); // استخدام الترجمة
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('validation_email_required')); // استخدام الترجمة
      return;
    }
    if (!isEmail(formData.email)) {
      toast.error(t('validation_email_invalid')); // استخدام الترجمة
      return;
    }
    if (!formData.department) {
      toast.error(t('validation_department_required')); // استخدام الترجمة
      return;
    }
    if (!formData.role) {
      toast.error(t('validation_role_required')); // استخدام الترجمة
      return;
    }
    if (!formData.manager) {
      toast.error(t('validation_manager_required')); // استخدام الترجمة
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error(t('validation_dob_required')); // استخدام الترجمة
      return;
    }
    if (!formData.dateOfEmployment) {
      toast.error(t('validation_doe_required')); // استخدام الترجمة
      return;
    }
    if (formData.phone && !isNumeric(formData.phone)) {
      toast.error(t('validation_phone_numeric')); // استخدام الترجمة
      return;
    }
    if (formData.alternatePhone && !isNumeric(formData.alternatePhone)) {
      toast.error(t('validation_alt_phone_numeric')); // استخدام الترجمة
      return;
    }
    if (formData.salary && isNaN(Number(formData.salary))) {
      toast.error(t('validation_salary_numeric')); // استخدام الترجمة
      return;
    }
    if (formData.dateOfBirth && formData.dateOfEmployment) {
      const dob = new Date(formData.dateOfBirth);
      const empd = new Date(formData.dateOfEmployment);
      if (empd < dob) {
        toast.error(t('validation_date_mismatch')); // استخدام الترجمة
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
        toast.success(t('success_employee_created')); // استخدام الترجمة
        navigate('/dashboard/hr/employees');
      } 
    } catch (err: any) {
      console.error('Create employee error', err);

      const message =
        err?.message ||
        err?.err?.message ||
        err?.response?.data?.message ||
        err?.err?.errorResponse?.errmsg ||
        '';

      if (message.includes('E11000 duplicate key error')) {
        if (message.includes('email')) {
          toast.error(t('error_email_duplicate')); // استخدام الترجمة
        } else if (message.includes('phone')) {
          toast.error(t('error_phone_duplicate')); // استخدام الترجمة
        } else if (message.includes('alternativePhone')) {
          toast.error(t('error_alt_phone_duplicate')); // استخدام الترجمة
        } else {
          toast.error(t('error_duplicate_field')); // استخدام الترجمة
        }
      } else {
        toast.error(t(message || 'error_creating_employee')); // استخدام الترجمة
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
          <h1 className="text-3xl font-bold text-gray-900">{t('hr_management')}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>{t('dashboard')}</span>
            <span>&gt;</span>
            <span>{t('hr')}</span>
            <span>&gt;</span>
            <span>{t('add')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">{t('personal_details')}</h2>

          {/* Personal Details Grid */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('employee_name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('job_title')}</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('national_id')}</label>
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
            <div className="w-full h-36 bg-white rounded flex items-center justify-center text-gray-400 mb-2 text-xs overflow-hidden border border-gray-300">
              {image ? (
                <img
                  src={image}
                  alt="Employee avatar preview"
                  className="w-full h-full object-contain object-center bg-white"
                />
              ) : (
                <span className="text-gray-400 text-sm">{t('image_preview')}</span>
              )}
            </div>

            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded text-xs hover:bg-gray-800 transition-all">
                  {image ? <Edit2 size={14} /> : <Upload size={14} />}
                  <span>{image ? t('edit_image') : t('upload_image')}</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {image && (
                <button 
                  onClick={() => { setImage(null); setImageFile(null); }}
                  className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  {t('remove')}
                </button>
              )}
            </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('date_of_birth')}</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('alternate_phone')}</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Job Details Section */}
          <h2 className="text-base font-semibold text-gray-900 mb-5 mt-6">{t('job_details')}</h2>

          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('department')}</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('work_location')}</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('role')}</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('manager')}</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('level_of_experience')}</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                <option value="Junior">{t('junior')}</option>
                <option value="Mid-Level">{t('mid_level')}</option>
                <option value="Senior">{t('senior')}</option>
                <option value="Director">{t('director')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('employment_type')}</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value=""></option>
                <option value="full-time">{t('full_time')}</option>
                <option value="part-time">{t('part_time')}</option>
                <option value="project-based">{t('project_based')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('salary')}</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('date_of_employment')}</label>
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
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
            >
              {t('save_details')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeScreen;