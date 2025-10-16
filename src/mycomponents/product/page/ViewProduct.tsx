import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ أضفنا دي
import type { Product } from "src/types/Product";

interface ViewProductProps {
  product?: Product;
  onBack?: () => void;
  onEdit?: () => void;
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

const ViewProduct: React.FC<ViewProductProps> = ({
  product = defaultProduct,
}) => {
  const navigate = useNavigate(); // ✅ استخدمناها هنا

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
          <span>View Product</span>
        </div>
      </div>

      {/* Product Details Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Product Details
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Product Name
              </label>
              <p className="text-lg text-gray-900 font-medium">{product.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Category
              </label>
              <p className="text-lg text-gray-900">{product.category}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Description
              </label>
              <p className="text-gray-900 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Code
              </label>
              <p className="text-lg text-gray-900 font-mono">{product.code}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Price
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {product.price} SR
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Tax
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {product.tax} SR
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Units
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {product.units}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-slate-700">
                  {product.total} SR
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
                <img
                  src={product.image ?? "https://via.placeholder.com/200"}
                  alt={product.name}
                  className="w-64 h-64 object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Product Image</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium transition-all hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Back to Products
          </button>
          <button
            onClick={() => navigate("/dashboard/products/edit/:id")}
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;