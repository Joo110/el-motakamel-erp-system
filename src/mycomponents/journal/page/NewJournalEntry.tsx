import React, { useState, useEffect } from "react";
import { Save, X, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import useJournalEntries from "../hooks/useJournalEntries";
import useAccounts from "../../accounts/hooks/useAccounts";
import useJournal from "../hooks/useJournal";
import { useTranslation } from "react-i18next";

interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

const NewJournalEntry = () => {
  const { t } = useTranslation();

  const defaultLines: JournalLine[] = [
    { id: "1", accountId: "", description: "", debit: 0, credit: 0 },
    { id: "2", accountId: "", description: "", debit: 0, credit: 0 },
  ];

  const [selectedJournal, setSelectedJournal] = useState<string>("");
  const [lines, setLines] = useState<JournalLine[]>(defaultLines);
  const [saving, setSaving] = useState(false);

  const { accounts, refresh: refreshAccounts } = useAccounts();
  const { entries: journals, refresh: refreshJournals } = useJournal();
  const { createEntry } = useJournalEntries();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshAccounts();
        await refreshJournals();
      } catch (err) {
        console.error("Error fetching data", err);
        toast.error(`❌ ${t("Error fetching journals or accounts.")}`);
      }
    };
    void fetchData();
  }, [refreshAccounts, refreshJournals, t]);

  const handleJournalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJournal(e.target.value);
  };

  const handleLineChange = (
    id: string,
    field: keyof JournalLine,
    value: string | number
  ) => {
    setLines(
      (prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
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

  // helper: validate ObjectId (24 hex chars)
  const isValidObjectId = (v: any) => {
    return typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);
  };

  // try to map a display value to an account _id using accounts list
const findAccountIdFromValue = (val: string): string | null => {
  if (!val) return null;

  const byId = accounts.find(
    (a: any) => (a._id && a._id === val) || (a.id && a.id === val)
  );
  if (byId) return byId._id ?? byId.id ?? null;

  const byCode = accounts.find((a: any) => String(a.code) === String(val));
  if (byCode) return byCode._id ?? byCode.id ?? null;

  const byName = accounts.find((a: any) => String(a.name) === String(val));
  if (byName) return byName._id ?? byName.id ?? null;

  const byLabel = accounts.find(
    (a: any) => `${a.name} (${a.code})` === val
  );
  if (byLabel) return byLabel._id ?? byLabel.id ?? null;

  return null;
};

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (!selectedJournal) {
        toast.error(`❌ ${t("Please select a journal!")}`);
        setSaving(false);
        return;
      }

      const emptyLines = lines.filter(
        (line) => !line.accountId || !line.description.trim()
      );
      if (emptyLines.length > 0) {
        toast.error(`❌ ${t("Please fill all line details!")}`);
        setSaving(false);
        return;
      }

      if (!isBalanced()) {
        toast.error(`❌ ${t("Entry is not balanced! Debit must equal Credit.")}`);
        setSaving(false);
        return;
      }

      // --- normalize & validate accountIds ---
      const normalizedLines: Array<{ accountId: string; description: string; debit: number; credit: number }> = [];
      const errors: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        let accountVal = ln.accountId?.toString?.().trim() ?? "";

        if (!accountVal) {
          errors.push(`Line ${i + 1}: ${t("Account is required")}`);
          continue;
        }

        if (!isValidObjectId(accountVal)) {
          // try to auto-map using accounts list
          const mapped = findAccountIdFromValue(accountVal);
          if (mapped && isValidObjectId(mapped)) {
            accountVal = mapped;
          } else {
            // not mappable -> collect error
            errors.push(
              `Line ${i + 1}: ${t('invalid account ID format')}: "${accountVal}". ${t('Please select the account from the dropdown (must be an internal ID).')}`
            );
            continue;
          }
        }

        normalizedLines.push({
          accountId: accountVal,
          description: ln.description,
          debit: Number(ln.debit) || 0,
          credit: Number(ln.credit) || 0,
        });
      }

      if (errors.length > 0) {
        const message = errors.join(" — ");
        toast.error(`❌ ${message}`);
        console.warn("Validation errors before submit:", errors);
        setSaving(false);
        return;
      }

      const payload = {
        journalId: selectedJournal, // correct field expected by the API
        lines: normalizedLines,
      };

      await createEntry(payload);
      toast.success(`✅ ${t("Journal entry created successfully!")}`);
      setSelectedJournal("");
      setLines(defaultLines);
    } catch (error: any) {
      console.error("❌ Error creating journal entry:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        t("Error creating journal entry. Please try again.");
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedJournal("");
    setLines(defaultLines);
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
          <h1 className="text-3xl font-bold text-gray-800">{t("Journal Entries")}</h1>
        </div>
      </div>

      {/* Journal Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Select Journal")}<span className="text-red-500 ml-1">*</span>
        </label>
        <select
          value={selectedJournal}
          onChange={handleJournalChange}
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
        >
          <option value="">{t("Select a journal...")}</option>
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
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">{t("Account")}</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">{t("Description")}</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-32">{t("Debit (SR)")}</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-32">{t("Credit (SR)")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line, index) => (
                <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleLineChange(line.id, "accountId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">{t("Select account...")}</option>
                      {accounts.map((account: any) => (
                        <option key={account._id ?? account.id} value={account._id ?? account.id}>
                          {account.name} ({account.code})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(line.id, "description", e.target.value)}
                      placeholder={t("Enter description...")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={line.debit || ""}
                      onChange={(e) => handleLineChange(line.id, "debit", Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={line.credit || ""}
                      onChange={(e) => handleLineChange(line.id, "credit", Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end gap-8 mb-6 font-semibold">
        <div>{t("Total Debit")}: {totalDebit.toFixed(2)} SR</div>
        <div>{t("Total Credit")}: {totalCredit.toFixed(2)} SR</div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium"
        >
          <X size={18} />
          <span>{t("Cancel")}</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={saving || !balanced}
          className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-md font-medium transition-all ${
            saving || !balanced ? "bg-gray-400 cursor-not-allowed" : "bg-[#1f334d] hover:bg-gray-900"
          }`}
        >
          <Save size={18} />
          <span>{saving ? t("Saving...") : t("Save Entry")}</span>
        </button>
      </div>
    </div>
  );
};

export default NewJournalEntry;
