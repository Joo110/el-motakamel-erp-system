import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, FileText, DollarSign } from "lucide-react";
import { toast } from 'react-hot-toast';

interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

const NewJournalEntry = () => {
  const [selectedJournal, setSelectedJournal] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: Date.now().toString(),
      accountId: "",
      description: "",
      debit: 0,
      credit: 0,
    },
  ]);
  const [saving, setSaving] = useState(false);

  // Mock data - replace with your API calls
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch journals - replace with your API
    setJournals([
      { _id: "1", name: "Purchases Journal", code: "PUR-001" },
      { _id: "2", name: "Sales Journal", code: "SAL-001" },
      { _id: "3", name: "General Journal", code: "GEN-001" },
    ]);

    // Fetch accounts - replace with your API
    setAccounts([
      { _id: "68e263c43a862f2b919db4f4", name: "Assets - الأصول", code: "1000" },
      { _id: "68e2a8034f0c751aa68ebbd9", name: "Cash - النقدية", code: "1010" },
      { _id: "3", name: "Accounts Payable - الموردين", code: "2010" },
      { _id: "4", name: "Purchases - المشتريات", code: "5010" },
    ]);
  }, []);

  const handleJournalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJournal(e.target.value);
  };

  const handleLineChange = (
    id: string,
    field: keyof JournalLine,
    value: string | number
  ) => {
    setLines(
      lines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    );
  };

  const addNewLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString(),
      accountId: "",
      description: "",
      debit: 0,
      credit: 0,
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.id !== id));
    } else {
      toast.error("❌ You must have at least one line!");
    }
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    return { totalDebit, totalCredit };
  };

  const isBalanced = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    return totalDebit === totalCredit && totalDebit > 0;
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validation
      if (!selectedJournal) {
        toast.error("❌ Please select a journal!");
        setSaving(false);
        return;
      }

      const emptyLines = lines.filter(
        (line) => !line.accountId || !line.description.trim()
      );

      if (emptyLines.length > 0) {
        toast.error("❌ Please fill all line details!");
        setSaving(false);
        return;
      }

      if (!isBalanced()) {
        toast.error("❌ Entry is not balanced! Debit must equal Credit.");
        setSaving(false);
        return;
      }

      // Prepare data
      const payload = {
        jornalId: selectedJournal,
        lines: lines.map((line) => ({
          accountId: line.accountId,
          description: line.description,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
        })),
      };

      // API Call - replace with your actual endpoint
      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create journal entry");
      }

      toast.success("✅ Journal entry created successfully!");
      handleCancel();
    } catch (error: any) {
      console.error("❌ Error creating journal entry:", error);
      toast.error("❌ Error creating journal entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedJournal("");
    setLines([
      {
        id: Date.now().toString(),
        accountId: "",
        description: "",
        debit: 0,
        credit: 0,
      },
    ]);
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const balanced = isBalanced();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1f334d] rounded-lg">
            <FileText className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Journal Entries</h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>Dashboard</span>
          <span>›</span>
          <span>Accounting</span>
          <span>›</span>
          <span>Journal Entries</span>
          <span>›</span>
          <span className="text-gray-700">New Entry</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Create New Entry</h2>
          <div className="text-sm text-gray-500">إنشاء قيد محاسبي جديد</div>
        </div>

        {/* Journal Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Journal
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={selectedJournal}
            onChange={handleJournalChange}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select a journal...</option>
            {journals.map((journal) => (
              <option key={journal._id} value={journal._id}>
                {journal.name} ({journal.code})
              </option>
            ))}
          </select>
        </div>

        {/* Journal Lines Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-8">#</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Account</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-32">Debit (SR)</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-32">Credit (SR)</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lines.map((line, index) => (
                  <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <select
                        value={line.accountId}
                        onChange={(e) =>
                          handleLineChange(line.id, "accountId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      >
                        <option value="">Select account...</option>
                        {accounts.map((account) => (
                          <option key={account._id} value={account._id}>
                            {account.name} ({account.code})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(line.id, "description", e.target.value)
                        }
                        placeholder="Enter description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={line.debit || ""}
                        onChange={(e) =>
                          handleLineChange(line.id, "debit", Number(e.target.value))
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-right"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={line.credit || ""}
                        onChange={(e) =>
                          handleLineChange(line.id, "credit", Number(e.target.value))
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeLine(line.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove line"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-right text-sm font-semibold text-gray-700">
                    Total:
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-gray-900">
                    {totalDebit.toFixed(2)} SR
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-gray-900">
                    {totalCredit.toFixed(2)} SR
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Add Line Button */}
        <button
          onClick={addNewLine}
          className="flex items-center gap-2 px-4 py-2.5 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all font-medium mb-6"
        >
          <Plus size={18} />
          <span>Add New Line</span>
        </button>

        {/* Balance Status */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
            balanced
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex-shrink-0">
            {balanced ? (
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-semibold ${balanced ? "text-green-900" : "text-red-900"}`}>
              {balanced ? "✅ Entry is Balanced" : "❌ Entry is Not Balanced"}
            </p>
            <p className={`text-sm ${balanced ? "text-green-700" : "text-red-700"}`}>
              {balanced
                ? "Debit equals Credit - Ready to save"
                : `Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)} SR`}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Accounting Entry Rules</h4>
              <p className="text-sm text-blue-800">
                • Total Debit must equal Total Credit<br />
                • Each line must have an account and description<br />
                • Amount should be entered in either Debit OR Credit column, not both
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving || !balanced}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-md font-medium transition-all ${
              saving || !balanced
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1f334d] hover:bg-gray-900"
            }`}
          >
            <Save size={18} />
            <span>{saving ? "Saving..." : "Save Entry"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewJournalEntry;