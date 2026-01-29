import React, { useMemo, useState } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSuppliers } from '../hooks/useSuppliers';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const SupplierSearchList: React.FC = () => {
  const { t } = useTranslation();
  const { suppliers, loading, error, removeSupplier, fetchSuppliers } = useSuppliers(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Normalize suppliers: support either Supplier[] or { data: Supplier[] , ... }
  const suppliersList = useMemo(() => {
    if (Array.isArray(suppliers)) return suppliers;
    const s: any = suppliers;
    if (s && Array.isArray(s.data)) return s.data;
    return [];
  }, [suppliers]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm(t('confirm_delete_supplier'))) return;

    try {
      await removeSupplier(id);
      toast.success(t('supplier_deleted_success'));
      // refresh from server to ensure state matches backend (handles id vs _id issues)
      await fetchSuppliers?.();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error(t('delete_failed'));
    }
  };

  const filtered = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return suppliersList ?? [];
    return (suppliersList ?? []).filter(
      (s: any) =>
        (s.name ?? '').toString().toLowerCase().includes(term) ||
        (s.email ?? '').toString().toLowerCase().includes(term) ||
        (s.phone ?? '').toString().toLowerCase().includes(term) ||
        (s.address ?? '').toString().toLowerCase().includes(term)
    );
  }, [suppliersList, searchTerm]);

  const totalPages = Math.ceil((filtered.length || 0) / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, rowsPerPage]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // helper to get id compat (supports either _id or id)
  const getId = (supplier: any) => supplier?._id ?? supplier?.id ?? '';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('supplier_management')}</h1>
            <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('supplier_search')}</p>
          </div>
          <Link
            to="/dashboard/precious/supplier/new"
            className="bg-gray-800 hover:bg-blue-800 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <span className="text-lg">+</span> {t('add_supplier')}
          </Link>
        </div>

        {/* Supplier Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('supplier_search')}</h2>
            <button className="text-gray-400">▼</button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t('clear')}
            </button>
          </div>
        </div>

        {/* Supplier Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('suppliers')}</h2>
              <p className="text-sm text-gray-500">
                {t('showing')}{' '}
                {paginatedData.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filtered.length)}`
                  : 0}{' '}
                {t('of')} {filtered.length} {t('suppliers')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('name')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('address')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('email')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('phone')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((supplier: any, idx: number) => (
                    <tr key={getId(supplier) || idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link
                          to={`/dashboard/precious/supplier/${getId(supplier)}`}
                          className="flex items-center gap-3"
                        >
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{supplier.address}</td>
                      <td className="py-4 px-4 text-gray-600">{supplier.email}</td>
                      <td className="py-4 px-4 text-gray-600">{supplier.phone}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/dashboard/precious/supplier/edit/${getId(supplier)}`}
                            className="text-blue-600 hover:text-blue-800 rounded-full p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(getId(supplier))}
                            className="text-red-600 hover:text-red-800 rounded-full p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        {loading ? t('loading_suppliers') : error ?? t('no_suppliers_found')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('show')}</span>
                <select
                  className="border border-gray-300 rounded-full px-2 py-1 text-sm"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-sm text-gray-600">{t('entries')}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50"
                  disabled={currentPage === 1}
                >
                  {t('previous')}
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      currentPage === i + 1
                        ? 'bg-gray-800 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={handleNext}
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50"
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
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
