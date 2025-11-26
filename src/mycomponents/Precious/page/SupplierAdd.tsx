import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Suppliers } from "../hooks/Suppliers";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const SupplierAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addSupplier, loading } = Suppliers(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(t('please_enter_supplier_name'));
      return false;
    }
    if (!form.address.trim()) {
      toast.error(t('please_enter_address'));
      return false;
    }
    if (!form.email.trim()) {
      toast.error(t('please_enter_email'));
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error(t('invalid_email_format'));
      return false;
    }
    if (!form.phone.trim()) {
      toast.error(t('please_enter_phone'));
      return false;
    }
    // Basic phone validation (digits only, length 6-15)
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error(t('invalid_phone_number'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return; // Stop if validation fails
    try {
      await addSupplier({
        ...form,
        organizationId: ["68c2d89e2ee5fae98d57bef1"],
        createdBy: "68c034e28feb5edb98b6ee36",
      });
      toast.success(t('supplier_added_successfully'));
      navigate("/dashboard/precious/suppliers");
    } catch (err) {
      console.error(err);
      toast.error(t('failed_to_add_supplier'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('precious_management')}</h1>
          <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('precious')} &gt; {t('add_supplier')}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{t('add_supplier_title')}</h2>

          {["name", "address", "email", "phone"].map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-semibold mb-2 capitalize">
                {field === "name" ? t('supplier_name') : t(field)}
              </label>
              <input
                name={field}
                type={field === "email" ? "email" : "text"}
                value={(form as any)[field]}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => navigate("/dashboard/precious/suppliers")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full"
            >
              {t('cancel_label')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierAdd;