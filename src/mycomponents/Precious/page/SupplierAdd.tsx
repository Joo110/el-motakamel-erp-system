import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Suppliers } from "../hooks/Suppliers";

const SupplierAdd = () => {
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

  const handleSave = async () => {
    await addSupplier({
      ...form,
      organizationId: ["68c2d89e2ee5fae98d57bef1"],
      createdBy: "68c034e28feb5edb98b6ee36",
    });
    navigate("/dashboard/supplier");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Add Supplier</h2>

        {["name", "address", "email", "phone"].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-semibold mb-2 capitalize">
              {field}
            </label>
            <input
              name={field}
              value={(form as any)[field]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-full"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gray-800 text-white px-6 py-2 rounded-full"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default SupplierAdd;
