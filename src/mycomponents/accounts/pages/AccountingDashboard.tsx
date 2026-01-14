import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import useAccounts from '../hooks/useAccounts';
import { useTranslation } from 'react-i18next';
//import { toast } from 'react-hot-toast';

const AccountingDashboard: React.FC = () => {
  const { accounts, loading, refresh, createAccount, deleteAccount } = useAccounts();

  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', code: '' });
  const [entries, setEntries] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { t } = useTranslation();

  useEffect(() => {
    const totalAccounts = accounts?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalAccounts / entries));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [entries, accounts, currentPage]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalAccounts = accounts?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalAccounts / entries));
  const start = totalAccounts === 0 ? 0 : (currentPage - 1) * entries + 1;
  const end = Math.min(currentPage * entries, totalAccounts);

  const paginated = useMemo(() => {
    const startIdx = (currentPage - 1) * entries;
    return (accounts ?? []).slice(startIdx, startIdx + entries);
  }, [accounts, currentPage, entries]);

  const getPaginationPages = (current: number, total: number, maxVisible = 5) => {
    const pages: number[] = [];
    const half = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, current - half);
    let endPage = Math.min(total, current + half);

    if (endPage - startPage + 1 < maxVisible) {
      if (startPage === 1) {
        endPage = Math.min(total, startPage + maxVisible - 1);
      } else if (endPage === total) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.code) return;
    try {
      const created = await createAccount({ name: newAccount.name.trim(), code: newAccount.code.trim() });
      if (created) {
        await refresh();
      }
      setNewAccount({ name: '', code: '' });
      setShowModal(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to create account', err);
    }
  };

  const handleDeleteAccount = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteAccount(id);
      await refresh();
      const newTotal = Math.max(0, (accounts?.length ?? 1) - 1);
      const newTotalPages = Math.max(1, Math.ceil(newTotal / entries));
      if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('accounting')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('Dashboard')} &gt;  {t('Accounting')} &gt; {t('Journals')}
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-lg shadow">
          {/* Top Bar - responsive (stacks on small screens) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-b border-gray-200 gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{t('Accounts')}</h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm text-gray-600">
                {t('Showing')} {start}-{end} of {totalAccounts} {t('inventory')}
              </span>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Add_Account')}</span>
                <span className="sm:hidden text-sm">{t('Add')}</span>
              </button>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="py-12 text-center text-gray-500">{t('Loading accounts...')}</div>
            ) : (
              // responsive grid: 1 col on xs, 2 on md, 3 on lg
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((acc: any) => {
                  const id = acc._id ?? acc.id ?? String(acc.code ?? Math.random());
                  return (
                    <div
                      key={id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[120px] break-words"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <h3 className="font-semibold text-gray-900 break-words">{acc.name}</h3>
                          <span className="text-sm text-gray-600 whitespace-nowrap">{t('Code:')} {acc.code}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">{acc.type ?? 'Type'}</p>
                        </div>
                      </div>

                      {/* Delete Button - bottom right */}
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleDeleteAccount(id)}
                          title="Delete account"
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Pagination - responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('Show')}</span>
              <select
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
              <span className="text-sm text-gray-600">{t('entries')}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                {t('Previous')}
              </button>

              {getPaginationPages(currentPage, totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === p ? 'bg-slate-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                {t('Next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Account</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Name')}
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="e.g. expenses"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Code')}
                </label>
                <input
                  type="text"
                  value={newAccount.code}
                  onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                  placeholder="e.g. 59000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleAddAccount}
                className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium flex items-center gap-2"
              >
                {t('Add Account')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;