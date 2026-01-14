// src/mycomponents/Sales/CustomerAdd.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ORG_ID = import.meta.env.VITE_ORG_ID || '68c2d89e2ee5fae98d57bef1';

const CustomerAdd: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createNewCustomer } = useCustomers(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    currency: 'EGP',
    notes: '',
    country: '',
    city: '',
    taxNumber: '',
  });
  const [saving, setSaving] = useState(false);

  const onChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(t('customer_name_required', 'Customer name is required'));
      return false;
    }
    if (!form.email.trim()) {
      toast.error(t('email_required', 'Email is required'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error(t('invalid_email_format', 'Invalid email format'));
      return false;
    }
    if (!form.phone.trim()) {
      toast.error(t('phone_required', 'Phone number is required'));
      return false;
    }
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error(t('invalid_phone_format', 'Phone number should contain 6-15 digits only'));
      return false;
    }
    if (!form.address.trim()) {
      toast.error(t('address_required', 'Address is required'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await createNewCustomer(ORG_ID, form);
      toast.success(t('customer_created_successfully', 'Customer created successfully'));
      navigate('/dashboard/sales/customers');
    } catch (err) {
      console.error('Create failed', err);
      toast.error(t('create_failed', 'Create failed. Check console.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('sales_management', 'Sales Management')}</h1>
          <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('sales')} &gt; {t('add')}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('add_customer', 'Add Customer')}</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('id_label', 'Id:')}</p>
              <p className="font-semibold text-gray-900">#1346HC</p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('Name', 'Name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('address', 'Address:')}</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => onChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email', 'Email:')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phone', 'Phone:')}</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>         
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => navigate(-1)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full">
              {t('cancel', 'Cancel')}
            </button>
            <button onClick={handleSave} className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full">
              {saving ? t('saving', 'Saving...') : t('save_details', 'Save Details')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAdd;