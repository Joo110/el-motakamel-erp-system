// src/mycomponents/HR/page/AddEmployeeScreen.tsx
import React, { useState } from 'react';
import { useDepartments } from '../../Department/hooks/useDepartments';
import { useEmployees } from '../../HR/hooks/useEmployees';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Edit2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosClient from "@/lib/axiosClient";

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
  const { t } = useTranslation();
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

  // new states for CV
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState<string>('');

  const { departments = [] } = useDepartments();
  const { createEmployee } = useEmployees();

  const fakeManagers = [
    { id: '696407925278be5e9b469fe4', name: 'Ahmed Mohamed Updated' },
    { id: '69079a32b9644d425bffc67f', name: 'Mohamed Ali' },
    { id: '69079a32b9644d425bffc680', name: 'Ali Hassan' },
  ];

  const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  const isNumeric = (s: string) => /^\d+$/.test(s.trim());

  const parseFlexibleDateToISO = (input: string): string | null => {
    if (!input) return null;
    const v = input.trim();
    const isoMatch = /^\d{4}-\d{1,2}-\d{1,2}$/.test(v);
    if (isoMatch) {
      const date = new Date(v);
      if (!Number.isNaN(date.getTime())) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    }
    const dmyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(v);
    if (dmyMatch) {
      const dd = Number(dmyMatch[1]);
      const mm = Number(dmyMatch[2]);
      const yyyy = Number(dmyMatch[3]);
      const date = new Date(yyyy, mm - 1, dd);
      if (!Number.isNaN(date.getTime()) && date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd) {
        const mmS = String(mm).padStart(2, '0');
        const ddS = String(dd).padStart(2, '0');
        return `${yyyy}-${mmS}-${ddS}`;
      }
      return null;
    }
    const parsed = new Date(v);
    if (!Number.isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  };

  const formatPhoneToE164 = (raw?: string): string | null => {
    if (!raw) return null;
    const cleaned = String(raw).replace(/\D/g, '');
    if (!cleaned) return null;
    if (cleaned.startsWith('20') || cleaned.startsWith('966')) {
      return `+${cleaned}`;
    }
    if (cleaned.length >= 10 && cleaned.startsWith('0')) {
      const no0 = cleaned.substring(1);
      const second = cleaned[1];
      if (second === '1' || second === '0' || second === '2' || second === '5') {
        return `+20${no0}`;
      }
      if (second === '5') {
        return `+966${no0}`;
      }
    }
    if (cleaned.length === 9) {
      return `+20${cleaned}`;
    }
    return `+${cleaned}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error(t('validation_image_too_large'));
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

  // CV upload handler (keeps UI minimal and consistent with image upload area)
  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // allowed types: pdf, doc, docx
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error(t('validation_cv_type_invalid') || 'CV must be PDF or DOC/DOCX');
      return;
    }

    // limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('validation_cv_too_large') || 'CV must be smaller than 10MB');
      return;
    }

    setCvFile(file);
    setCvName(file.name);
    toast.success(t('cv_ready_to_upload') || 'CV ready');
  };

  const normalizeRole = (input: string) => {
    const v = (input || '').trim();
    if (!v) return '';
    const low = v.toLowerCase();
    if (low === 'hr') return 'HR';
    if (low === 'ceo') return 'CEO';
    if (['admin', 'employee', 'manager', 'accountant', 'supervisor'].includes(low)) return low;
    return low;
  };

  const normalizeLevel = (input: string) => {
    const v = (input || '').trim();
    if (!v) return '';
    const low = v.toLowerCase();
    if (low === 'junior') return 'junior';
    if (low.includes('mid')) return 'mid';
    if (low.includes('senior')) return 'senior';
    if (low.includes('expert') || low.includes('director')) return 'expert';
    return low;
  };

  const normalizeEmploymentType = (input: string) => {
    if (!input) return '';
    const low = input.trim().toLowerCase();
    if (['full_time', 'full-time', 'fulltime', 'full time', 'fullTime'].includes(low)) return 'full_time';
    if (['part_time', 'part-time', 'parttime', 'part time', 'partTime'].includes(low)) return 'part_time';
    if (['project_based', 'project-based', 'projectbased', 'project based', 'projectBased'].includes(low)) return 'project_based';
    return low;
  };

  const [saving, setSaving] = useState(false);

  // upload CV document to the endpoint
const uploadEmployeeDocuments = async (employeeId: string) => {
  if (!cvFile) return;

  const fd = new FormData();
  fd.append('documents', cvFile);

  const res = await axiosClient.post(
    `/employees/documents/${employeeId}`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return res.data;
};

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t('validation_name_required'));
      return;
    }
    if (!formData.jobTitle.trim()) {
      toast.error(t('validation_job_title_required'));
      return;
    }
    if (!formData.nationalId.trim()) {
      toast.error(t('validation_national_id_required'));
      return;
    }
    if (!isNumeric(formData.nationalId.trim()) || formData.nationalId.trim().length < 6) {
      toast.error(t('validation_national_id_invalid'));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('validation_email_required'));
      return;
    }
    if (!isEmail(formData.email)) {
      toast.error(t('validation_email_invalid'));
      return;
    }
    if (!formData.department) {
      toast.error(t('validation_department_required'));
      return;
    }
    if (!formData.role) {
      toast.error(t('validation_role_required'));
      return;
    }
    if (!formData.manager) {
      toast.error(t('validation_manager_required'));
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error(t('validation_dob_required'));
      return;
    }
    if (!formData.dateOfEmployment) {
      toast.error(t('validation_doe_required'));
      return;
    }

    const birthIso = parseFlexibleDateToISO(formData.dateOfBirth);
    const empIso = parseFlexibleDateToISO(formData.dateOfEmployment);
    if (!birthIso) {
      toast.error(t('validation_birthdate_invalid') || 'Birth date must be a valid date');
      return;
    }
    if (!empIso) {
      toast.error(t('validation_employmentdate_invalid') || 'Employment date must be a valid date');
      return;
    }
    const dob = new Date(birthIso);
    const empd = new Date(empIso);
    if (empd < dob) {
      toast.error(t('validation_date_mismatch'));
      return;
    }

    const phoneE164 = formatPhoneToE164(formData.phone);
    if (formData.phone && !phoneE164) {
      toast.error(t('validation_phone_numeric'));
      return;
    }
    const altPhoneE164 = formatPhoneToE164(formData.alternatePhone);

    if (formData.salary && isNaN(Number(formData.salary))) {
      toast.error(t('validation_salary_numeric'));
      return;
    }

    try {
      setSaving(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('jobTitle', formData.jobTitle);
      form.append('nationalId', formData.nationalId);
      form.append('address', formData.address);
form.append('birth_date', birthIso); // اسم مختلف
      form.append('email', formData.email);
      if (phoneE164) form.append('phone', phoneE164);
      if (altPhoneE164) form.append('alternativePhone', altPhoneE164);
      form.append('department', formData.department);
      form.append('workLocation', formData.workLocation || '');
      const normalizedRole = normalizeRole(formData.role);
      form.append('role', normalizedRole || formData.role);
      const normalizedLevel = normalizeLevel(formData.level);
      if (normalizedLevel) form.append('levelOfExperience', normalizedLevel);
      const normalizedType = normalizeEmploymentType(formData.employmentType);
      if (normalizedType) form.append('employmentType', normalizedType);
      form.append('manager', formData.manager);
      if (formData.salary) form.append('salary', String(Number(formData.salary)));
      form.append('employmentDate', empIso);
      if (imageFile) form.append('avatar', imageFile);

      // create employee using existing hook (expects FormData or similar)
      const created = await createEmployee(form as unknown as any);

      // try to extract employee id from response in a few common shapes
      let employeeId: string | undefined;
      if (!created) {
        throw new Error('Create employee returned empty response');
      }
      // possible shapes: created._id, created.id, created.data._id, created.data.id, created.data.data._id (multiple APIs)
      employeeId =
        (created as any)._id ??
        (created as any).id ??
        (created as any)?.data?._id ??
        (created as any)?.data?.id ??
        (created as any)?.data?.data?._id ??
        (created as any)?.employee?._id ??
        undefined;

      // fallback: if created is axios response object, check created.data
      if (!employeeId && (created as any).data && typeof (created as any).data === 'object') {
        const d = (created as any).data;
        employeeId = d._id ?? d.id ?? d?.data?._id ?? d?.data?.id ?? undefined;
      }

      if (!employeeId) {
        // Best-effort: if object has array with created employee (unlikely), try to find string id field
        const strId = Object.values(created as any).find((v: any) => typeof v === 'string' && v.length > 5);
        if (typeof strId === 'string') employeeId = strId;
      }

      if (!employeeId) {
        // creation succeeded but couldn't determine id — inform user and stop CV upload
        toast.success(t('success_employee_created'));
        navigate('/dashboard/hr/employees');
        return;
      }

      // if cv provided upload it
      if (cvFile) {
        try {
          await uploadEmployeeDocuments(employeeId);
          toast.success(t('cv_uploaded_success') || 'CV uploaded successfully');
        } catch (err) {
          console.error('CV upload failed', err);
          toast.error(t('cv_upload_failed') || 'CV upload failed');
        }
      }

      toast.success(t('success_employee_created'));
      navigate('/dashboard/hr/employees');
    } catch (err: any) {
      console.error('Create employee error', err);
      const message =
        err?.message ||
        err?.err?.message ||
        err?.response?.data?.message ||
        err?.err?.errorResponse?.errmsg ||
        '';
      if (typeof message === 'string' && message.includes('E11000 duplicate key error')) {
        if (message.includes('email')) {
          toast.error(t('error_email_duplicate'));
        } else if (message.includes('phone')) {
          toast.error(t('error_phone_duplicate'));
        } else if (message.includes('alternativePhone')) {
          toast.error(t('error_alt_phone_duplicate'));
        } else {
          toast.error(t('error_duplicate_field'));
        }
      } else {
        toast.error(t(message || 'error_creating_employee'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="Text-base font-semibold text-gray-900 mb-5">{t('personal_details')}</h2>

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

              {/* CV upload control (keeps visual style minimal and in the same area) */}
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded text-xs border border-gray-300 hover:bg-gray-50 transition-all">
                    <Upload size={14} />
                    <span>{cvName ? cvName : t('upload_cv')}</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCvUpload}
                    className="hidden"
                  />
                </label>
                {cvName && (
                  <div className="mt-1 text-xs text-gray-500">
                    {t('selected_file')}: {cvName}
                    <button
                      onClick={() => { setCvFile(null); setCvName(''); }}
                      className="ml-3 text-red-500 underline text-xs"
                    >
                      {t('remove')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                type="text"
                value={formData.dateOfBirth}
                placeholder="YYYY-MM-DD"
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
                <option value="696d00000000000000000001">Demo Department</option>
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
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
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
                <option value="junior">{t('junior')}</option>
                <option value="mid">{t('mid_level')}</option>
                <option value="senior">{t('senior')}</option>
                <option value="expert">{t('director')}</option>
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
                <option value="full_time">{t('full_time')}</option>
                <option value="part_time">{t('part_time')}</option>
                <option value="project_based">{t('project_based')}</option>
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
                type="text"
                value={formData.dateOfEmployment}
                placeholder="YYYY-MM-DD"
                onChange={(e) => setFormData({ ...formData, dateOfEmployment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

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
              disabled={saving}
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
