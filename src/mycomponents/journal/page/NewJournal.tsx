import React, { useState } from "react";
import { BookOpen, Save, X } from "lucide-react";
import { toast } from 'react-hot-toast';
import useJournal from "../hooks/useJournal";
import { useTranslation } from 'react-i18next';

const NewJournal = () => {
  const { t } = useTranslation();
  const { entries, createEntry, refresh } = useJournal();

  const [formData, setFormData] = useState({
    name: "",
    jornalType: "",
    code: "",
  });

  const [saving, setSaving] = useState(false);
  const [customTypeMode, setCustomTypeMode] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "__add_new__") {
      setCustomTypeMode(true);
      setFormData({ ...formData, jornalType: "" });
      return;
    }

    setCustomTypeMode(false);
    handleInputChange(e);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!formData.name.trim()) {
        toast.error(t("❌ Please enter journal name!"));
        setSaving(false);
        return;
      }

      if (!formData.code.trim()) {
        toast.error(t("❌ Please enter journal code!"));
        setSaving(false);
        return;
      }

      if (!formData.jornalType.trim()) {
        toast.error(t("❌ Please enter or select journal type!"));
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        date: new Date().toISOString(),
        description: "",
        
      };

      const result = await createEntry(payload);

      if (result?.err?.code === 11000) {
        toast.error(t("❌ This journal code is already in use!"));
        setSaving(false);
        return;
      }

      await refresh();

      toast.success(t("✅ Journal created successfully!"));
      handleCancel();
    } catch (error: any) {
      console.error("❌ Error creating journal:", error);

      if (error?.err?.code === 11000) {
        toast.error(t("❌ This journal code is already in use!"));
      } else {
        toast.error(t("❌ Error creating journal. Please try again."));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      jornalType: "",
      code: "",
    });
    setCustomTypeMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1f334d] rounded-lg">
            <BookOpen className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{t('Journal Management')}</h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>{t('Dashboard')}</span>
          <span>›</span>
          <span>{t('Accounting')}</span>
          <span>›</span>
          <span>{t('Journals')}</span>
          <span>›</span>
          <span className="text-gray-700">{t('New Journal')}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">{t('Create New Journal')}</h2>
            <div className="text-sm text-gray-500">{t('إنشاء دفتر يومية جديد')}</div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Journal Name')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder={t('Enter journal name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Journal Type')}
                <span className="text-red-500 ml-1">*</span>
              </label>

              {!customTypeMode ? (
                <select
                  name="jornalType"
                  value={formData.jornalType}
                  onChange={handleTypeSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="">{t('-- Select Journal Type --')}</option>
                  {entries.map((j) => (
                    <option key={j._id} value={j.jornalType}>
                      {j.jornalType} — {j.name}
                    </option>
                  ))}
                  <option value="__add_new__" className="font-bold text-blue-600">
                    {t('➕ Add new type...')}
                  </option>
                </select>
              ) : (
                <input
                  type="text"
                  name="jornalType"
                  value={formData.jornalType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder={t('Write new journal type...')}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Journal Code')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder={t('Enter unique journal code')}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">{t('About Journals')}</h4>
                  <p className="text-sm text-blue-800">
                    {t('Journals are used to record financial transactions.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium"
            >
              <X size={18} />
              <span>{t('Cancel')}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-md font-medium transition-all ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#1f334d] hover:bg-gray-900"
              }`}
            >
              <Save size={18} />
              <span>{saving ? t('Saving...') : t('Save Journal')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewJournal;