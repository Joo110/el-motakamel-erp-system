import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, ChevronDown, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Trash2 } from 'lucide-react';
import { useJournal } from '../hooks/useJournal';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import type { JournalEntry as ServiceJournalEntry } from '../services/journalService';
import { toast } from 'react-hot-toast';

interface Journal {
  _id: string;
  name: string;
  code: string;
  jornalType: string;
}

const JournalEntriesViewer: React.FC = () => {
  const { entries: hookJournals, loading: hookLoadingJournals } = useJournal();
  
  const { 
    entries, 
    loading: entriesLoading, 
    fetch: fetchEntries,
    setJournalId,
    removeEntry
  } = useJournal();

  const { accounts } = useAccounts();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournalId, setSelectedJournalId] = useState<string>('');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(hookJournals) && hookJournals.length > 0) {
      setJournals(hookJournals as unknown as Journal[]);
    }
  }, [hookJournals]);

  const getAccountName = (accountId: string): string => {
    const account = accounts.find(acc => acc._id === accountId || acc.id === accountId);
    return account?.name || 'Unknown Account';
  };

  const getAccountCode = (accountId: string): string | undefined => {
    const account = accounts.find(acc => acc._id === accountId || acc.id === accountId);
    return account?.code;
  };

  const handleJournalChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const journalId = e.target.value;
    setSelectedJournalId(journalId);
    const journal = journals.find(j => j._id === journalId) || null;
    setSelectedJournal(journal);
    setError(null);

    if (!journalId) return;

    setJournalId(journalId);
    await fetchEntries();
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      setDeletingId(entryId);
      await removeEntry(entryId);
      toast.success('✅ Entry deleted successfully');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('❌ Error deleting entry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    if (!selectedJournalId) return;
    try {
      await fetchEntries();
      toast.success('✅ Entries refreshed');
    } catch (err) {
      console.error('Error refreshing entries:', err);
      toast.error('❌ Error refreshing entries');
    }
  };

  const calculateEntryTotals = (entry: ServiceJournalEntry) => {
    const lines = (entry as any).lines || [];
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const calculateGrandTotals = () => {
    let grandDebit = 0;
    let grandCredit = 0;
    entries.forEach((entry: ServiceJournalEntry) => {
      const lines = (entry as any).lines || [];
      lines.forEach((line: any) => {
        grandDebit += line.debit || 0;
        grandCredit += line.credit || 0;
      });
    });
    return { grandDebit, grandCredit };
  };

  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const { grandDebit, grandCredit } = calculateGrandTotals();
  const loading = entriesLoading || hookLoadingJournals;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal Entries Viewer</h1>
          <p className="text-sm text-gray-500">Dashboard › Accounting › Journal Entries</p>
        </div>

        {/* Journal Selection Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Select Journal
            </h2>
            {selectedJournalId && (
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Journal
              </label>
              <div className="relative">
                <select
                  value={selectedJournalId}
                  onChange={handleJournalChange}
                  disabled={hookLoadingJournals}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white text-gray-900 font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">-- Select a Journal --</option>
                  {journals.map((journal) => (
                    <option key={journal._id} value={journal._id}>
                      {journal.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedJournal && (
              <div className="md:col-span-1">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Selected Journal</p>
                  <p className="text-sm font-bold text-blue-900">{selectedJournal.name}</p>
                  <p className="text-xs text-blue-700 mt-1">Code: {selectedJournal.code}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {selectedJournalId && entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm font-medium">Total Debit</p>
                <TrendingUp className="w-6 h-6 text-green-100" /> 
              </div>
              <p className="text-3xl font-bold">{formatCurrency(grandDebit)}</p>
              <p className="text-green-100 text-sm mt-1">SR</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-100 text-sm font-medium">Total Credit</p>
                <TrendingDown className="w-6 h-6 text-red-100" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(grandCredit)}</p>
              <p className="text-red-100 text-sm mt-1">SR</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm font-medium">Total Entries</p>
                <FileText className="w-6 h-6 text-blue-100" />
              </div>
              <p className="text-3xl font-bold">{entries.length}</p>
              <p className="text-blue-100 text-sm mt-1">
                {grandDebit === grandCredit ? '✓ Balanced' : '✗ Unbalanced'}
              </p>
            </div>
          </div>
        )}

        {/* Entries Display */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading journal entries...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : !selectedJournalId ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Journal Selected</h3>
            <p className="text-gray-500">Please select a journal from the dropdown above to view its entries.</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Entries Found</h3>
            <p className="text-gray-500">This journal doesn't have any entries yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, entryIndex) => {
              const { totalDebit, totalCredit, isBalanced } = calculateEntryTotals(entry);
              const entryData = entry as any;
              const lines = entryData.lines || [];

              return (
                <div key={entryData._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Entry Header */}
                  <div className="bg-gradient-to-r from-[#1f334d] to-gray-800 px-6 py-4 text-white">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold">#{entryIndex + 1}</span>
                        <div>
                          <p className="text-sm text-gray-300">Entry ID</p>
                          <p className="font-mono text-sm">{entryData._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-300">Created At</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <p className="text-sm font-medium">{formatDate(entryData.createdAt)}</p>
                          </div>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isBalanced
                              ? 'bg-green-500/20 text-green-200 border border-green-400'
                              : 'bg-red-500/20 text-red-200 border border-red-400'
                          }`}
                        >
                          {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(entryData._id)}
                          disabled={deletingId === entryData._id}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Entry"
                        >
                          <Trash2 className={`w-4 h-4 text-red-200 ${deletingId === entryData._id ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Entry Lines Table */}
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">#</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">Account</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">Description</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                              <div className="flex items-center justify-end gap-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                Debit (SR)
                              </div>
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                              <div className="flex items-center justify-end gap-1">
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                Credit (SR)
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line: any, lineIndex: number) => (
                            <tr key={line._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4 text-gray-600 text-sm">{lineIndex + 1}</td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {line.accountId ? getAccountName(line.accountId) : (line.accountName || 'N/A')}
                                  </p>
                                  {(line.accountId ? getAccountCode(line.accountId) : line.accountCode) && (
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                      {line.accountId ? getAccountCode(line.accountId) : line.accountCode}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-700">{line.description}</td>
                              <td className="py-4 px-4 text-right font-mono">
                                {line.debit > 0 ? <span className="text-green-600 font-bold">{formatCurrency(line.debit)}</span> : <span className="text-gray-300">-</span>}
                              </td>
                              <td className="py-4 px-4 text-right font-mono">
                                {line.credit > 0 ? <span className="text-red-600 font-bold">{formatCurrency(line.credit)}</span> : <span className="text-gray-300">-</span>}
                              </td>
                            </tr>
                          ))}

                          {/* Entry Total */}
                          <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                            <td colSpan={3} className="py-4 px-4 text-right text-gray-900">Entry Total:</td>
                            <td className="py-4 px-4 text-right font-mono text-green-700 text-lg">{formatCurrency(totalDebit)}</td>
                            <td className="py-4 px-4 text-right font-mono text-red-700 text-lg">{formatCurrency(totalCredit)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  <h3 className="text-xl font-semibold">Grand Total</h3>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm text-gray-300">Debit</p>
                    <p className="text-lg font-bold">{formatCurrency(grandDebit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Credit</p>
                    <p className="text-lg font-bold">{formatCurrency(grandCredit)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntriesViewer;