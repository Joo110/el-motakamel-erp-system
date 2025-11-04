import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Suppliers } from "../hooks/Suppliers";
import { toast } from "react-hot-toast";

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

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Please enter supplier name.");
      return false;
    }
    if (!form.address.trim()) {
      toast.error("Please enter address.");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Please enter email.");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email format.");
      return false;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter phone number.");
      return false;
    }
    // Basic phone validation (digits only, length 6-15)
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Invalid phone number. Only digits allowed (6-15 characters).");
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
      toast.success("Supplier added successfully!");
      navigate("/dashboard/supplier");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add supplier.");
    }
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
