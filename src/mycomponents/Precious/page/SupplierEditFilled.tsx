import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Suppliers } from "../hooks/Suppliers";

const SupplierEditFilled: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSupplierById, editSupplier } = Suppliers(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  // ✅ جلب بيانات المورد عند تحميل الصفحة
  useEffect(() => {
    if (id) {
      fetchSupplierById(id).then((data) => {
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

  // ✅ تحديث بيانات الفورم عند التغيير
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ حفظ التعديلات
  const handleSave = async () => {
    if (id) {
      await editSupplier(id, form);
      navigate("/dashboard/supplier");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Precious Management</h1>
          <p className="text-sm text-gray-500">Dashboard &gt; Precious &gt; Edit</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Details</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">Id:</p>
              <p className="font-semibold text-gray-900">{id}</p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address:
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone:
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-red-500 text-4xl font-bold mb-3">⚡ {form.name || "Supplier"}</div>
              <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm">
                Change Image
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full"
              onClick={() => navigate("/dashboard/supplier")}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full"
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierEditFilled;