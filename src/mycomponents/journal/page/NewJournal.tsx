import React, { useState } from "react";
import { BookOpen, Save, X } from "lucide-react";
import { toast } from 'react-hot-toast';

const NewJournal = () => {
  const [formData, setFormData] = useState({
    name: "",
    jornalType: "purchases",
    code: "",
  });
  const [saving, setSaving] = useState(false);

  const journalTypes = [
    { value: "purchases", label: "Purchases - المشتريات" },
    { value: "sales", label: "Sales - المبيعات" },
    { value: "general", label: "General - عام" },
    { value: "payment", label: "Payment - المدفوعات" },
    { value: "receipt", label: "Receipt - المقبوضات" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.name.trim()) {
        toast.error("❌ Please enter journal name!");
        setSaving(false);
        return;
      }

      if (!formData.code.trim()) {
        toast.error("❌ Please enter journal code!");
        setSaving(false);
        return;
      }

      // API Call - replace with your actual endpoint
      const response = await fetch("/api/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      // Handle duplicate code error
      if (result?.err?.code === 11000 || result?.code === 11000) {
        toast.error("❌ This journal code is already in use!");
        setSaving(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create journal");
      }

      toast.success("✅ Journal created successfully!");
      handleCancel();
    } catch (error: any) {
      console.error("❌ Error creating journal:", error);
      
      if (error?.response?.data?.err?.code === 11000 || error?.err?.code === 11000) {
        toast.error("❌ This journal code is already in use!");
      } else {
        toast.error("❌ Error creating journal. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      jornalType: "purchases",
      code: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1f334d] rounded-lg">
            <BookOpen className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Journal Management</h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>Dashboard</span>
          <span>›</span>
          <span>Accounting</span>
          <span>›</span>
          <span>Journals</span>
          <span>›</span>
          <span className="text-gray-700">New Journal</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">Create New Journal</h2>
            <div className="text-sm text-gray-500">إنشاء دفتر يومية جديد</div>
          </div>

          <div className="space-y-6">
            {/* Journal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="Enter journal name (e.g., Daily Purchases)"
              />
            </div>

            {/* Journal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="jornalType"
                value={formData.jornalType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                {journalTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Journal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal Code
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="Enter unique journal code (e.g., PUR-001)"
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 This code must be unique for each journal
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">About Journals</h4>
                  <p className="text-sm text-blue-800">
                    Journals are used to record financial transactions. Each journal has a unique code and type that helps organize your accounting records.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-md font-medium transition-all ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#1f334d] hover:bg-gray-900"
              }`}
            >
              <Save size={18} />
              <span>{saving ? "Saving..." : "Save Journal"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewJournal;