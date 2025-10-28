// src/mycomponents/Precious/page/SupplierSearchList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Suppliers } from '../hooks/Suppliers';

const SupplierSearchList: React.FC = () => {
  const { suppliers, loading, error, fetchSuppliers, removeSupplier } = Suppliers(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!suppliers || suppliers.length === 0) {
      fetchSuppliers?.(); // ✅ مناداة بدون void ولا شرط truthiness
    }
  }, [suppliers, fetchSuppliers]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      console.log('🗑️ Trying to delete supplier:', id);
      const res: any = await removeSupplier(id); // ✅ خلي res من نوع any عشان نتعامل مع success و status
      console.log('🧩 Delete response:', res);

      const isDeleted =
        !res ||
        res.success === true ||
        res?.status === 204 ||
        res?.status === 'success' ||
        (typeof res?.message === 'string' && res.message.toLowerCase().includes('deleted'));

      if (isDeleted) {
        console.log('✅ Supplier deleted successfully');
        await fetchSuppliers?.();
      } else {
        console.warn('⚠️ Unexpected delete response:', res);
        alert('Supplier may not have been deleted. Check console for details.');
      }
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('Delete failed. Check console.');
    }
  };

  const filtered = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return suppliers ?? [];
    return (suppliers ?? []).filter(
      (s) =>
        (s.name ?? '').toLowerCase().includes(term) ||
        (s.email ?? '').toLowerCase().includes(term) ||
        (s.phone ?? '').toLowerCase().includes(term) ||
        (s.address ?? '').toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Supplier Search</p>
          </div>
          <Link
            to="/dashboard/precious/supplier/new"
            className="bg-gray-800 hover:bg-blue-800 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Supplier
          </Link>
        </div>

        {/* Supplier Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Supplier Search</h2>
            <button className="text-gray-400">▼</button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers by name, phone, or email..."
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

        {/* Supplier Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Suppliers</h2>
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
                  {filtered.map((supplier, idx) => (
                    <tr key={supplier._id ?? idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link
                          to={`/dashboard/precious/supplier/${supplier._id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{supplier.address}</td>
                      <td className="py-4 px-4 text-gray-600">{supplier.email}</td>
                      <td className="py-4 px-4 text-gray-600">{supplier.phone}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/dashboard/precious/supplier/edit/${supplier._id}`}
                            className="text-blue-600 hover:text-blue-800 rounded-full p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(supplier._id)}
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
                        {loading ? 'Loading suppliers...' : error ?? 'No suppliers found.'}
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

export default SupplierSearchList;