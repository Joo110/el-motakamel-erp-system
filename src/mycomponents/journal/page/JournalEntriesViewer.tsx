import React, { useState } from 'react';
import { FileText, Calendar, DollarSign, ChevronDown, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface JournalLine {
  _id: string;
  accountId: string;
  accountName?: string;
  accountCode?: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  _id: string;
  jornalId: string;
  lines: JournalLine[];
  createdAt: string;
  updatedAt: string;
}

interface Journal {
  _id: string;
  name: string;
  code: string;
  jornalType: string;
}

// بيانات وهمية
const MOCK_JOURNALS: Journal[] = [
  { _id: 'j1', name: 'Daily Purchases Journal', code: 'PUR-001', jornalType: 'purchases' },
  { _id: 'j2', name: 'Sales Journal', code: 'SAL-001', jornalType: 'sales' },
  { _id: 'j3', name: 'General Journal', code: 'GEN-001', jornalType: 'general' },
];

const MOCK_ENTRIES: Record<string, JournalEntry[]> = {
  j1: [
    {
      _id: 'e1',
      jornalId: 'j1',
      createdAt: '2025-10-05T17:20:35.717Z',
      updatedAt: '2025-10-05T17:20:35.717Z',
      lines: [
        { _id: 'l1', accountId: 'a1', accountName: 'Office Equipment', accountCode: '1500', description: 'شراء اجهزه لاب توب', debit: 2000, credit: 0 },
        { _id: 'l2', accountId: 'a2', accountName: 'Cash', accountCode: '1010', description: 'شراء اجهزه لاب توب', debit: 0, credit: 2000 },
      ],
    },
    {
      _id: 'e2',
      jornalId: 'j1',
      createdAt: '2025-10-06T10:15:20.500Z',
      updatedAt: '2025-10-06T10:15:20.500Z',
      lines: [
        { _id: 'l3', accountId: 'a3', accountName: 'Office Supplies', accountCode: '1520', description: 'شراء مستلزمات مكتبية', debit: 1500, credit: 0 },
        { _id: 'l4', accountId: 'a4', accountName: 'Accounts Payable', accountCode: '2010', description: 'شراء مستلزمات مكتبية', debit: 0, credit: 1500 },
      ],
    },
  ],
  j2: [
    {
      _id: 'e3',
      jornalId: 'j2',
      createdAt: '2025-11-01T09:00:00.000Z',
      updatedAt: '2025-11-01T09:00:00.000Z',
      lines: [
        { _id: 'l5', accountId: 'a5', accountName: 'Cash', accountCode: '1010', description: 'بيع منتجات', debit: 5000, credit: 0 },
        { _id: 'l6', accountId: 'a6', accountName: 'Sales Revenue', accountCode: '4010', description: 'بيع منتجات', debit: 0, credit: 5000 },
      ],
    },
  ],
};

const JournalEntriesViewer: React.FC = () => {
  const [journals] = useState<Journal[]>(MOCK_JOURNALS);
  const [selectedJournalId, setSelectedJournalId] = useState<string>('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJournals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // عند اختيار الجورنال، نجيب البيانات من MOCK
  React.useEffect(() => {
    if (selectedJournalId) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        const mockEntries = MOCK_ENTRIES[selectedJournalId] || [];
        setEntries(mockEntries);
        setLoading(false);
      }, 300); // Simulate loading
    } else {
      setEntries([]);
    }
  }, [selectedJournalId]);

  const calculateEntryTotals = (entry: JournalEntry) => {
    const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const calculateGrandTotals = () => {
    let grandDebit = 0;
    let grandCredit = 0;
    entries.forEach(entry => {
      entry.lines.forEach(line => {
        grandDebit += line.debit;
        grandCredit += line.credit;
      });
    });
    return { grandDebit, grandCredit };
  };

  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getJournalTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      purchases: { bg: 'bg-purple-100', text: 'text-purple-800' },
      sales: { bg: 'bg-green-100', text: 'text-green-800' },
      general: { bg: 'bg-blue-100', text: 'text-blue-800' },
    };
    return badges[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const selectedJournal = journals.find(j => j._id === selectedJournalId);
  const { grandDebit, grandCredit } = calculateGrandTotals();

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
                onClick={() => setSelectedJournalId(selectedJournalId)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
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
                  onChange={(e) => setSelectedJournalId(e.target.value)}
                  disabled={loadingJournals}
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
                      {journal.name} ({journal.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedJournal && (
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Journal Type
                </label>
                <div className="h-12 flex items-center">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${getJournalTypeBadge(selectedJournal.jornalType).bg} ${getJournalTypeBadge(selectedJournal.jornalType).text}`}
                  >
                    {selectedJournal.jornalType.toUpperCase()}
                  </span>
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

              return (
                <div key={entry._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Entry Header */}
                  <div className="bg-gradient-to-r from-[#1f334d] to-gray-800 px-6 py-4 text-white">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold">#{entryIndex + 1}</span>
                        <div>
                          <p className="text-sm text-gray-300">Entry ID</p>
                          <p className="font-mono text-sm">{entry._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-300">Created At</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <p className="text-sm font-medium">{formatDate(entry.createdAt)}</p>
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
                      </div>
                    </div>
                  </div>

                  {/* Entry Lines Table */}
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                              #
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                              Account
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                              Description
                            </th>
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
                          {entry.lines.map((line, lineIndex) => (
                            <tr
                              key={line._id}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-4 text-gray-600 text-sm">{lineIndex + 1}</td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {line.accountName || 'N/A'}
                                  </p>
                                  {line.accountCode && (
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                      {line.accountCode}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-700">{line.description}</td>
                              <td className="py-4 px-4 text-right font-mono">
                                {line.debit > 0 ? (
                                  <span className="text-green-600 font-bold">
                                    {formatCurrency(line.debit)}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right font-mono">
                                {line.credit > 0 ? (
                                  <span className="text-red-600 font-bold">
                                    {formatCurrency(line.credit)}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            </tr>
                          ))}

                          {/* Entry Total */}
                          <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                            <td colSpan={3} className="py-4 px-4 text-right text-gray-900">
                              Entry Total:
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-green-700 text-lg">
                              {formatCurrency(totalDebit)}
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-red-700 text-lg">
                              {formatCurrency(totalCredit)}
                            </td>
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
                  <h3 className="text-xl font-bold">Grand Total</h3>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Total Debit</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(grandDebit)} SR</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Total Credit</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(grandCredit)} SR</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Balance</p>
                    <p
                      className={`text-2xl font-bold ${
                        grandDebit === grandCredit ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    >
                      {grandDebit === grandCredit ? '✓ OK' : `${formatCurrency(Math.abs(grandDebit - grandCredit))} SR`}
                    </p>
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
