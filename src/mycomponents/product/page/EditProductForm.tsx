import React, { useState } from "react";
import { ChevronRight, ChevronDown, Upload } from "lucide-react";
import type { Product } from "src/types/Product";

interface EditProductFormProps {
  product?: Product;
  onCancel?: () => void;
}

const defaultProduct: Product = {
  id: 0,
  name: "Wireless Bluetooth Earbuds",
  category: "Electronics",
  description:
    "Lightweight wireless Bluetooth earbuds, IPX4 water resistant, battery life up to 6 hours, USB-C charging.",
  code: "75864",
  price: 334.0,
  tax: 12.0,
  units: 34,
  total: 48665.005,
  image:
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
};

const EditProductForm: React.FC<EditProductFormProps> = ({
  product = defaultProduct,
  onCancel,
}) => {
  const [productName, setProductName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description);
  const [code, setCode] = useState(product.code);
  const [price, setPrice] = useState(product.price.toString());
  const [tax, setTax] = useState(product.tax.toString());
  const [units, setUnits] = useState(product.units.toString());

  const calculateTotal = () => {
    const priceNum = parseFloat(price) || 0;
    const taxNum = parseFloat(tax) || 0;
    const unitsNum = parseFloat(units) || 0;
    return ((priceNum + taxNum) * unitsNum).toFixed(3);
  };

  const handleSave = () => {
    const updatedProduct: Product = {
      ...product,
      name: productName,
      category,
      description,
      code,
      price: parseFloat(price),
      tax: parseFloat(tax),
      units: parseFloat(units),
      total: parseFloat(calculateTotal()),
    };

    console.log("✅ Updated product:", updatedProduct);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Products Management
        </h1>
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white appearance-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option>Electronics</option>
                  <option>Footwear</option>
                  <option>Clothing</option>
                  <option>Accessories</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Price
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tax
                </label>
                <input
                  type="text"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Units
                </label>
                <input
                  type="text"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-sm font-medium text-gray-900">Total: </span>
              <span className="text-lg font-bold text-gray-900">
                {calculateTotal()} SR
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center mb-6">
                <img
                  src={product.image || "https://via.placeholder.com/200"}
                  alt="Product"
                  className="w-64 h-64 object-contain mb-6"
                />
              </div>
              <div className="flex gap-4">
                <button className="flex-1 px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium hover:bg-gray-100 transition-all">
                  Edit Image
                </button>
                <button className="flex-1 px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm flex items-center justify-center gap-2 transition-all">
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
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;