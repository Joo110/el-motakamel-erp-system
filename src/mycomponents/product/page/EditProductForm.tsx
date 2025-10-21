import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight, ChevronDown, Upload } from "lucide-react";
import { useProducts } from "../hooks/useProducts";

const EditProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id!;

  const { getProductById, updateProduct } = useProducts();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Clothing" },
    { _id: "3", name: "Food" },
    { _id: "4", name: "Furniture" },
  ];

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [tax, setTax] = useState("");
  const [units, setUnits] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(productId);

        if (!mounted) return;
        if (!productData?._id) {
          console.error("❌ Product ID missing");
          return;
        }

        setProductName(productData.name || "");
        setCategory(productData.category || categories[0]._id);
        setDescription(productData.description || "");
        setCode(productData.code || "");
        setPrice(String(productData.price ?? ""));
        setTax(String(productData.tax ?? ""));
        setUnits(String(productData.unit ?? ""));
        setImage(typeof productData.img?.[0] === "string" ? productData.img[0] : "");
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("❌ Error loading product data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (productId) fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [productId, getProductById]);

  const calculateTotal = () => {
    const priceNum = parseFloat(price) || 0;
    const taxNum = parseFloat(tax) || 0;
    const unitsNum = parseFloat(units) || 0;
    return ((priceNum + taxNum) * unitsNum).toFixed(3);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        price: parseFloat(price) || 1000,
      };

      console.log("📦 Payload to send:", payload);

      await updateProduct(productId, payload);
      alert("✅ Product updated successfully!");
    } catch (error) {
      console.error("❌ Failed to update product:", error);
      alert("Error updating product. Check console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading product...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span>Products</span>
          <ChevronRight className="w-4 h-4" />
          <span>Edit Product</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={() => { /* readonly: prevent changes */ }}
                  tabIndex={-1}
                  aria-readonly="true"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white appearance-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Price</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tax</label>
                <input
                  type="text"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Units</label>
                <input
                  type="text"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-sm font-medium text-gray-900">Total: </span>
              <span className="text-lg font-bold text-gray-900">{calculateTotal()} SR</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center mb-6">
                <img
                  src={image || "https://via.placeholder.com/200"}
                  alt="Product"
                  className="w-64 h-64 object-contain mb-6"
                />
              </div>
              <div className="flex gap-4">
                {/* kept buttons visually identical but they do nothing (readonly image) */}
                <button
                  onClick={() => {}}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium hover:bg-gray-100 transition-all"
                >
                  Edit Image
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all ${
              saving ? "bg-gray-400" : "bg-slate-700 hover:bg-slate-800"
            }`}
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;