// src/mycomponents/Sales/CustomerAdd.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../../Sales/hooks/useCustomers';

const ORG_ID = import.meta.env.VITE_ORG_ID || '68c2d89e2ee5fae98d57bef1';

const CustomerAdd: React.FC = () => {
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

  const handleSave = async () => {
    if (!form.name) {
      alert('Customer name required');
      return;
    }
    setSaving(true);
    try {
      await createNewCustomer(ORG_ID, form);
      alert('Customer created');
      navigate('/dashboard/sales/customers');
    } catch (err) {
      console.error('Create failed', err);
      alert('Create failed. Check console.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-sm text-gray-500">Dashboard &gt; Sales  &gt; Add</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Customer</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">Id:</p>
              <p className="font-semibold text-gray-900">#1346HC</p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name:</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address:</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => onChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone:</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img src="https://via.placeholder.com/150x100/e5e7eb/6b7280?text=Customer" alt="Location" className="rounded-lg mb-3" />
              <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm">Change Image</button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => navigate(-1)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full">Cancel</button>
            <button onClick={handleSave} className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full">
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAdd;