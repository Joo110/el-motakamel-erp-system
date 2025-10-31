// src/mycomponents/Sales/CustomerSearchList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { toast } from 'react-hot-toast';

const CustomerSearchList: React.FC = () => {
  const { customers, loading, error, fetchCustomers, removeCustomer } = useCustomers(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!customers || customers.length === 0) void fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const handleDelete = async (id?: string) => {
  if (!id) return;
  if (!window.confirm('Are you sure you want to delete this customer?')) return;

  try {
    console.log('🗑️ Trying to delete customer:', id);
    const res = await removeCustomer(id);

    console.log('🧩 Delete response:', res);

    const isDeleted =
      !res ||
      res.success === true ||
      (res as any)?.status === 204 ||
      (res as any)?.status === 'success' ||
      (typeof (res as any)?.message === 'string' &&
        (res as any).message.toLowerCase().includes('deleted'));

    if (isDeleted) {
      console.log('✅ Customer deleted successfully');
      await fetchCustomers(); 
    } else {
      console.warn('⚠️ Unexpected delete response:', res);
      toast('Customer may not have been deleted. Check console for details.');
    }
  } catch (err) {
    console.error('❌ Delete failed:', err);
    toast('Delete failed. Check console.');
  }
};

  const filtered = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return customers ?? [];
    return (customers ?? []).filter((c) =>
      (c.name ?? '').toLowerCase().includes(term) ||
      (c.email ?? '').toLowerCase().includes(term) ||
      (c.phone ?? '').toLowerCase().includes(term) ||
      (c.address ?? '').toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Customer Search</p>
          </div>
          <Link
            to="/dashboard/sales/customer/new"
            className="bg-gray-800 hover:bg-blue-800 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Customer
          </Link>
        </div>

        {/* Customer Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Search</h2>
            <button className="text-gray-400">▼</button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {}}
              className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
              <p className="text-sm text-gray-500">
                Showing {filtered.length > 0 ? `1-${Math.min(filtered.length, 10)}` : 0} of {filtered.length} Supplier
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer, idx) => (
                    <tr key={customer._id ?? idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link
                          to={`/dashboard/sales/customer/${customer._id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{customer.address}</td>
                      <td className="py-4 px-4 text-gray-600">{customer.email}</td>
                      <td className="py-4 px-4 text-gray-600">{customer.phone}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/dashboard/sales/customer/edit/${customer._id}`}
                            className="text-blue-600 hover:text-blue-800 rounded-full p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="text-red-600 hover:text-red-800 rounded-full p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        {loading ? 'Loading customers...' : error ?? 'No customers found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select className="border border-gray-300 rounded-full px-2 py-1 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearchList;