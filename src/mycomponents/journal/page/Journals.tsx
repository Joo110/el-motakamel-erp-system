import React, { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useJournal from '../hooks/useJournal';

const JournalsList: React.FC = () => {

  const { entries, loading, refresh, removeEntry } = useJournal();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    void refresh();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await removeEntry(id);
      toast.success('Journal deleted successfully!');
      await refresh();
    } catch {
      toast.error('Failed to delete journal');
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return entries.filter(
      (j) =>
        j.name.toLowerCase().includes(term) ||
        j.jornalType.toLowerCase().includes(term) ||
        j.code.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, rowsPerPage]);

  // Badge بدون ألوان
  const getJournalTypeBadge = (type: string) => {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
        {type}
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounting Management</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Journals</p>
          </div>
          <Link
            to="/dashboard/journals/new"
            className="bg-[#1f334d] hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Journal</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl"
              />
            </div>
            <button
              onClick={() => void refresh()}
              className="bg-[#1f334d] hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all font-medium"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((journal) => (
                    <tr key={journal._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">{journal.code}</td>

                      <td className="py-4 px-4">{journal.name}</td>

                      <td className="py-4 px-4">
                        {getJournalTypeBadge(journal.jornalType)}
                      </td>

                      <td className="py-4 px-4">{formatDate(journal.createdAt)}</td>

                      <td className="py-4 px-4">
                        <div className="flex gap-2">

                          <button
                            onClick={() => handleDelete(journal._id!, journal.name)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg"
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
                        {loading ? 'Loading...' : 'No journals found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* البچيناشن القديم كما هو */}
            {paginatedData.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * rowsPerPage + 1}–
                  {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Prev
                  </button>
                  <span className="px-4 py-2">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default JournalsList;