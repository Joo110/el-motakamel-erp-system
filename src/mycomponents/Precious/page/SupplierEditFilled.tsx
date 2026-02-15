import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSuppliers } from "../hooks/Suppliers";
import { toast } from "react-hot-toast";
import { useTranslation } from 'react-i18next';
import type { Supplier } from '../services/suppliersService';

const SupplierEditFilled: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSupplierById, editSupplier } = useSuppliers(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (id) {
      fetchSupplierById(id).then((data: Supplier | null) => {
        if (data) {
          setForm({
            name: data.name || "",
            address: data.address || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        }
      });
    }
  }, [id, fetchSupplierById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===== Validation =====
  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(t('enter_supplier_name'));
      return false;
    }
    if (!form.address.trim()) {
      toast.error(t('enter_address'));
      return false;
    }
    if (!form.email.trim()) {
      toast.error(t('enter_email'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error(t('invalid_email_format'));
      return false;
    }
    if (!form.phone.trim()) {
      toast.error(t('enter_phone_number'));
      return false;
    }
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error(t('invalid_phone_number'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!id) return;
    if (!validateForm()) return;

    try {
      await editSupplier(id, form);
      toast.success(t('supplier_updated_success'));
      navigate("/dashboard/precious/suppliers");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(t('supplier_update_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('precious_management')}</h1>
          <p className="text-sm text-gray-500">
            {t('dashboard')} &gt; {t('precious')} &gt; {t('edit')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('edit_details')}</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('id')}:</p>
              <p className="font-semibold text-gray-900">{id}</p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              {["name", "address", "email", "phone"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                    {field === "name"
                      ? t('supplier_name')
                      : field === "address"
                      ? t('address')
                      : field === "email"
                      ? t('email')
                      : t('phone')}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full"
              onClick={() => navigate("/dashboard/supplier")}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full"
            >
              {t('save_details')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierEditFilled;
