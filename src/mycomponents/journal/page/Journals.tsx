import React, { useEffect, useMemo, useState } from 'react';
import { Search, Edit2, Trash2, FileText, Eye, Plus, X, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Journal {
  _id: string;
  name: string;
  jornalType: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

// The journal entry types (the JSON you provided)
interface RawLine {
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  _id: string;
}

interface RawJournalEntry {
  _id: string;
  jornalId: string;
  lines: RawLine[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// ----------------------
// MOCK / Provided data
// ----------------------
const MOCK_JOURNALS: Journal[] = [
  {
    _id: '68e2971636d2567392406fd8',
    name: 'Daily Purchases Journal',
    jornalType: 'purchases',
    code: 'PUR-001',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    _id: '68e2971636d2567392406fd9',
    name: 'Sales Journal',
    jornalType: 'sales',
    code: 'SAL-001',
    createdAt: '2025-01-14T09:20:00Z',
  },
  {
    _id: '68e2971636d2567392406fda',
    name: 'General Journal',
    jornalType: 'general',
    code: 'GEN-001',
    createdAt: '2025-01-13T14:15:00Z',
  },
];

// This is the data you gave — mapped by jornalId so we can show per-journal entries
const MOCK_JOURNAL_ENTRIES: Record<string, RawJournalEntry[]> = {
  '68e2971636d2567392406fd8': [
    {
      _id: '68e2a8e34f0c751aa68ebbe8',
      jornalId: '68e2971636d2567392406fd8',
      lines: [
        {
          accountId: '68e263c43a862f2b919db4f4',
          description: 'شراء اجهزه لاب توب',
          debit: 2000,
          credit: 0,
          _id: '68e2a8e34f0c751aa68ebbe9',
        },
        {
          accountId: '68e2a8034f0c751aa68ebbd9',
          description: 'شراء اجهزه لاب توب',
          debit: 0,
          credit: 2000,
          _id: '68e2a8e34f0c751aa68ebbea',
        },
      ],
      createdAt: '2025-10-05T17:20:35.717Z',
      updatedAt: '2025-10-05T17:20:35.717Z',
      __v: 0,
    },
  ],
  // other journals can be empty or have mock entries
  '68e2971636d2567392406fd9': [],
  '68e2971636d2567392406fda': [],
};

// ----------------------
// Custom hook (same behavior as before)
// ----------------------
const useJournals = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Keep original attempt to fetch from API but fallback to mock (same as before)
      const response = await fetch('/api/journals').catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        setJournals(data.journals || data || MOCK_JOURNALS);
      } else {
        // fallback
        setJournals(MOCK_JOURNALS);
      }
    } catch (err: any) {
      console.error('Error fetching journals:', err);
      setError(err.message || 'Failed to load journals');
      setJournals(MOCK_JOURNALS);
    } finally {
      setLoading(false);
    }
  };

  const removeJournal = async (id: string) => {
    try {
      const response = await fetch(`/api/journals/${id}`, {
        method: 'DELETE',
      }).catch(() => null);

      if (response && response.ok) {
        return await response.json();
      }
      // Simulate deletion fallback
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting journal:', err);
      throw err;
    }
  };

  return { journals, loading, error, fetchJournals, removeJournal };
};

// ----------------------
// JournalsList component with modal that shows entries when clicking any column/row
// ----------------------
const JournalsList: React.FC = () => {
  const navigate = useNavigate();
  const { journals, loading, error, fetchJournals, removeJournal } = useJournals();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal state
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false);
  const [modalJournal, setModalJournal] = useState<Journal | null>(null);
  const [modalEntries, setModalEntries] = useState<RawJournalEntry[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    void fetchJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      console.log('🗑️ Deleting journal:', id);
      await removeJournal(id);

      toast.success('✅ Journal deleted successfully!');
      await fetchJournals();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error('❌ Failed to delete journal');
    }
  };

  const handleViewEntriesNavigate = (journalId: string) => {
    navigate(`/dashboard/journals/${journalId}/jornalEntries`);
  };

  // Open entries modal (when user clicks any column/row)
  const openEntriesModal = (journal: Journal) => {
    setModalJournal(journal);
    setIsEntriesModalOpen(true);
    setModalLoading(true);

    // Simulate loading like an API call (we use the provided MOCK data)
    setTimeout(() => {
      const entries = MOCK_JOURNAL_ENTRIES[journal._id] || [];
      setModalEntries(entries);
      setModalLoading(false);
    }, 200); // small simulated delay
  };

  const filtered = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return journals ?? [];

    return (journals ?? []).filter((j) =>
      (j.name ?? '').toLowerCase().includes(term) ||
      (j.jornalType ?? '').toLowerCase().includes(term) ||
      (j.code ?? '').toLowerCase().includes(term)
    );
  }, [journals, searchTerm]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, rowsPerPage]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const getJournalTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      purchases: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Purchases' },
      sales: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sales' },
      general: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'General' },
      payment: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Payment' },
      receipt: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Receipt' },
    };

    const badge = badges[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helpers for modal totals & formatting
  const calculateEntryTotals = (entry: RawJournalEntry) => {
    const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const calculateGrandTotals = (entries: RawJournalEntry[]) => {
    let grandDebit = 0;
    let grandCredit = 0;
    entries.forEach(entry => {
      entry.lines.forEach(line => {
        grandDebit += line.debit || 0;
        grandCredit += line.credit || 0;
      });
    });
    return { grandDebit, grandCredit };
  };

  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const { grandDebit: modalGrandDebit, grandCredit: modalGrandCredit } = calculateGrandTotals(modalEntries);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounting Management</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Journals</p>
          </div>
          <Link
            to="/dashboard/journal/NewJournal"
            className="bg-[#1f334d] hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Journal</span>
          </Link>
        </div>

        {/* Journal Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-600" />
              Journal Search
            </h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, type, or code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => void fetchJournals()}
              className="bg-[#1f334d] hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all font-medium"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Journals Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Journals List
              </h2>
              <p className="text-sm text-gray-500">
                Showing{' '}
                {paginatedData.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                      currentPage * rowsPerPage,
                      filtered.length
                    )}`
                  : 0}{' '}
                of {filtered.length} journals
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((journal, idx) => (
                    <tr
                      key={journal._id ?? idx}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openEntriesModal(journal)} // click any column/row opens modal
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-900 font-medium">
                          {journal.code}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/dashboard/journals/${journal._id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          onClick={(e) => e.stopPropagation()} // avoid opening modal when clicking the link
                        >
                          {journal.name}
                        </Link>
                      </td>
                      <td className="py-4 px-4">{getJournalTypeBadge(journal.jornalType)}</td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {formatDate(journal.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewEntriesNavigate(journal._id); }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg p-2 transition-all"
                            title="View Journal Entries (navigate)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/dashboard/journals/edit/${journal._id}`}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg p-2 transition-all"
                            title="Edit Journal"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(journal._id, journal.name); }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg p-2 transition-all"
                            title="Delete Journal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span>Loading journals...</span>
                          </div>
                        ) : error ? (
                          <div className="text-red-600">
                            ❌ {error}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-12 h-12 text-gray-300" />
                            <p>No journals found.</p>
                            <Link
                              to="/dashboard/journals/new"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Create your first journal
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginatedData.length > 0 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#1f334d] text-white shadow-md'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================
          Entries Modal (opens when clicking any column/row)
         ========================= */}
      {isEntriesModalOpen && modalJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{modalJournal.name}</h3>
                  <p className="text-sm text-gray-500">{modalJournal.code} • {modalJournal.jornalType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setModalEntries([]); setIsEntriesModalOpen(false); }}
                  className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => { setIsEntriesModalOpen(false); }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600">Loading journal entries...</p>
                </div>
              ) : modalEntries.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Entries Found</h3>
                  <p className="text-gray-500">This journal doesn't have any entries yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-green-100 text-sm font-medium">Total Debit</p>
                        <TrendingUp className="w-6 h-6 text-green-100" />
                      </div>
                      <p className="text-3xl font-bold">{formatCurrency(modalGrandDebit)}</p>
                      <p className="text-green-100 text-sm mt-1">SR</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-red-100 text-sm font-medium">Total Credit</p>
                        <TrendingDown className="w-6 h-6 text-red-100" />
                      </div>
                      <p className="text-3xl font-bold">{formatCurrency(modalGrandCredit)}</p>
                      <p className="text-red-100 text-sm mt-1">SR</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-100 text-sm font-medium">Total Entries</p>
                        <FileText className="w-6 h-6 text-blue-100" />
                      </div>
                      <p className="text-3xl font-bold">{modalEntries.length}</p>
                      <p className="text-blue-100 text-sm mt-1">
                        {modalGrandDebit === modalGrandCredit ? '✓ Balanced' : '✗ Unbalanced'}
                      </p>
                    </div>
                  </div>

                  {/* Entries */}
                  {modalEntries.map((entry, entryIndex) => {
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
                                  <p className="text-sm font-medium">{new Date(entry.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">#</th>
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">Account</th>
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">Description</th>
                                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                                    <div className="flex items-center justify-end gap-1"><TrendingUp className="w-4 h-4 text-green-600" /> Debit (SR)</div>
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                                    <div className="flex items-center justify-end gap-1"><TrendingDown className="w-4 h-4 text-red-600" /> Credit (SR)</div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.lines.map((line, lineIndex) => (
                                  <tr key={line._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 text-gray-600 text-sm">{lineIndex + 1}</td>
                                    <td className="py-4 px-4">
                                      <div>
                                        <p className="font-semibold text-gray-900">{line.accountId}</p>
                                        {/* accountCode not provided in your data; show ID as fallback */}
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
                        <h3 className="text-xl font-bold">Grand Total</h3>
                      </div>
                      <div className="flex gap-8 text-right">
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Total Debit</p>
                          <p className="text-2xl font-bold text-green-400">{formatCurrency(modalGrandDebit)} SR</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Total Credit</p>
                          <p className="text-2xl font-bold text-red-400">{formatCurrency(modalGrandCredit)} SR</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Balance</p>
                          <p className={`text-2xl font-bold ${modalGrandDebit === modalGrandCredit ? 'text-green-400' : 'text-yellow-400'}`}>
                            {modalGrandDebit === modalGrandCredit ? '✓ OK' : `${formatCurrency(Math.abs(modalGrandDebit - modalGrandCredit))} SR`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default JournalsList;
